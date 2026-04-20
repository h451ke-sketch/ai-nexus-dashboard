#!/usr/bin/env node
// Build a JSON index of all skills, written to public/skills.json so that the
// CLI (and any other consumer) can list what's available without scraping HTML.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const SKILLS_DIR = path.join(cwd, 'skills');
const OUT = path.join(cwd, 'public', 'skills.json');

// Tiny YAML frontmatter parser — handles the subset we use:
//   ---
//   key: value
//   tags:
//     - one
//     - two
//   ---
function parseFrontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const lines = m[1].split(/\r?\n/);
  const data = {};
  let currentArrayKey = null;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line) continue;
    if (line.startsWith('  - ') || line.startsWith('- ')) {
      const v = line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '');
      if (currentArrayKey) {
        if (!Array.isArray(data[currentArrayKey])) data[currentArrayKey] = [];
        data[currentArrayKey].push(v);
      }
      continue;
    }
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    if (rawVal === '' || rawVal === '|' || rawVal === '>') {
      currentArrayKey = key;
      data[key] = [];
      continue;
    }
    currentArrayKey = null;
    let v = rawVal.trim().replace(/^["']|["']$/g, '');
    data[key] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

async function walk(dir, base = dir) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return []; }
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, base));
    else if (e.isFile()) {
      const stat = await fs.stat(full);
      out.push({
        path: path.relative(base, full).split(path.sep).join('/'),
        size: stat.size,
        mtime: stat.mtime,
      });
    }
  }
  return out;
}

async function main() {
  let entries;
  try { entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true }); }
  catch { entries = []; }
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  const skills = [];
  for (const slug of dirs) {
    const skillMd = path.join(SKILLS_DIR, slug, 'SKILL.md');
    let raw;
    try { raw = await fs.readFile(skillMd, 'utf8'); }
    catch { continue; }
    const { data } = parseFrontmatter(raw);
    const files = await walk(path.join(SKILLS_DIR, slug));
    const size = files.reduce((s, f) => s + f.size, 0);
    const updatedAt = files.reduce((max, f) => (f.mtime > max ? f.mtime : max), new Date(0)).toISOString();
    skills.push({
      slug,
      name: typeof data.name === 'string' ? data.name : slug,
      description: typeof data.description === 'string' ? data.description : '',
      version: typeof data.version === 'string' ? data.version : null,
      license: typeof data.license === 'string' ? data.license : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      fileCount: files.length,
      size,
      updatedAt,
      archive: `/archives/${slug}.zip`,
    });
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(skills, null, 2) + '\n');
  console.log(`✓ wrote ${path.relative(cwd, OUT)} (${skills.length} skill${skills.length === 1 ? '' : 's'})`);
}

main().catch((err) => {
  console.error('[build-index] failed:', err);
  process.exit(1);
});
