#!/usr/bin/env node
// Build a .zip archive for every skill folder under /skills and write to
// /public/archives/<slug>.zip. Each archive contains a top-level <slug>/ dir
// so users can unzip directly into their agent's skills directory.
import { createWriteStream, promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import archiver from 'archiver';

const cwd = process.cwd();
const SKILLS_DIR = path.join(cwd, 'skills');
const OUT_DIR = path.join(cwd, 'public', 'archives');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function pack(slug) {
  const src = path.join(SKILLS_DIR, slug);
  const out = path.join(OUT_DIR, `${slug}.zip`);
  await new Promise((resolve, reject) => {
    const output = createWriteStream(out);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(src, slug);
    archive.finalize();
  });
  const stat = await fs.stat(out);
  return { slug, bytes: stat.size, out };
}

async function main() {
  await ensureDir(OUT_DIR);

  let entries;
  try {
    entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[build-archives] no skills/ directory found at ${SKILLS_DIR}, skipping.`);
      return;
    }
    throw err;
  }

  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  // Drop stale archives whose source skill folder was removed.
  let existing;
  try {
    existing = await fs.readdir(OUT_DIR);
  } catch {
    existing = [];
  }
  const keep = new Set(slugs.map((s) => `${s}.zip`));
  for (const f of existing) {
    if (f.endsWith('.zip') && !keep.has(f)) {
      await fs.rm(path.join(OUT_DIR, f), { force: true });
      console.log(`× removed stale ${f}`);
    }
  }

  if (slugs.length === 0) {
    console.warn('[build-archives] no skills found.');
    return;
  }

  const results = await Promise.all(slugs.map(pack));
  for (const r of results) {
    const kb = (r.bytes / 1024).toFixed(1);
    console.log(`✓ ${r.slug.padEnd(28)} ${kb.padStart(8)} KB`);
  }
  console.log(`\n[build-archives] packed ${results.length} skill(s) into ${path.relative(cwd, OUT_DIR)}`);
}

main().catch((err) => {
  console.error('[build-archives] failed:', err);
  process.exit(1);
});
