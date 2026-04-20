import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked, type Token, type Tokens } from 'marked';

export const SKILLS_DIR = path.join(process.cwd(), 'skills');

export type SkillFile = {
  path: string;
  size: number;
};

export type SkillHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type Skill = {
  slug: string;
  name: string;
  description: string;
  version: string | null;
  license: string | null;
  tags: string[];
  body: string;
  bodyHtml: string;
  headings: SkillHeading[];
  files: SkillFile[];
  fileCount: number;
  size: number;
  updatedAt: string;
  archiveUrl: string;
  archiveSize: number | null;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeMarked(): Marked {
  // Per-instance Marked so we can register a custom heading renderer that
  // injects anchor ids without leaking globally between calls.
  const md = new Marked();
  md.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Token[]) => string } }, token: Tokens.Heading) {
        const text = this.parser.parseInline(token.tokens);
        const plain = text.replace(/<[^>]*>/g, '');
        const id = slugify(plain);
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },
    },
  });
  return md;
}

const md = makeMarked();

function extractHeadings(markdown: string): SkillHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: SkillHeading[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const level = m[1].length === 2 ? 2 : 3;
      const text = m[2].trim();
      headings.push({ id: slugify(text), text, level: level as 2 | 3 });
    }
  }
  return headings;
}

type WalkedFile = { rel: string; size: number; mtime: Date };

async function walk(dir: string, base = dir): Promise<WalkedFile[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: WalkedFile[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full, base)));
    } else if (entry.isFile()) {
      const stat = await fs.stat(full);
      out.push({
        rel: path.relative(base, full).split(path.sep).join('/'),
        size: stat.size,
        mtime: stat.mtime,
      });
    }
  }
  return out;
}

async function fileSize(p: string): Promise<number | null> {
  try {
    const stat = await fs.stat(p);
    return stat.size;
  } catch {
    return null;
  }
}

async function loadSkill(slug: string): Promise<Skill | null> {
  if (slug.startsWith('.') || slug.includes('/') || slug.includes('\\')) {
    return null;
  }

  const skillDir = path.join(SKILLS_DIR, slug);
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  let raw: string;
  try {
    raw = await fs.readFile(skillMdPath, 'utf8');
  } catch {
    return null;
  }

  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const files = await walk(skillDir);
  const size = files.reduce((sum, f) => sum + f.size, 0);
  const updatedAt = files
    .reduce((max, f) => (f.mtime > max ? f.mtime : max), new Date(0))
    .toISOString();

  const metadata = (typeof data.metadata === 'object' && data.metadata !== null
    ? (data.metadata as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const version =
    typeof data.version === 'string'
      ? data.version
      : typeof metadata.version === 'string'
        ? (metadata.version as string)
        : null;

  const tags = Array.isArray(data.tags)
    ? (data.tags as unknown[]).filter((t): t is string => typeof t === 'string')
    : [];

  const bodyHtml = md.parse(parsed.content, { async: false }) as string;
  const headings = extractHeadings(parsed.content);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const archiveUrl = `${basePath}/archives/${slug}.zip`;
  const archiveSize = await fileSize(
    path.join(process.cwd(), 'public', 'archives', `${slug}.zip`),
  );

  return {
    slug,
    name: typeof data.name === 'string' ? data.name : slug,
    description: typeof data.description === 'string' ? data.description : '',
    version,
    license: typeof data.license === 'string' ? data.license : null,
    tags,
    body: parsed.content,
    bodyHtml,
    headings,
    files: files
      .map((f) => ({ path: f.rel, size: f.size }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    fileCount: files.length,
    size,
    updatedAt,
    archiveUrl,
    archiveSize,
  };
}

export async function getAllSkills(): Promise<Skill[]> {
  let entries;
  try {
    entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const loaded = await Promise.all(dirs.map((d) => loadSkill(d)));
  return loaded
    .filter((s): s is Skill => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  return loadSkill(slug);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  if (diff < 30 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} months ago`;
  return `${Math.floor(diff / (365 * day))} years ago`;
}
