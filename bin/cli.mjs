#!/usr/bin/env node
// Tiny zero-dep companion CLI for the skills directory.
// Run via:   npx -p github:<owner>/<repo> skills <cmd>
//   list                      list all skills published on the site
//   add <slug> [--dest dir]   download and unpack a skill (default: ./skills)
//   new <name> [--dir dir]    scaffold a new skill folder with template SKILL.md
//
// Options:
//   --site <url>     override the site URL (env: SKILLS_SITE_URL)
//   --dest <path>    where to install
//   --dir  <path>    where to scaffold
//   --help           this message
//   --version        print version and exit

import { spawn } from 'node:child_process';
import { mkdir, writeFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';

const DEFAULT_SITE = 'https://ai-nexus-dashboard.vercel.app';
const VERSION = '0.1.0';

// ───────── ANSI colours (auto-disabled when not a TTY) ─────────
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (n) => (s) => (useColor ? `\x1b[${n}m${s}\x1b[0m` : String(s));
const dim = c(2);
const bold = c(1);
const red = c(31);
const green = c(32);
const cyan = c(36);
const yellow = c(33);

function stripAnsi(s) {
  return String(s).replace(/\x1b\[\d+m/g, '');
}

function fail(msg) {
  process.stderr.write(`${red('error')} ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { args.help = true; continue; }
    if (a === '--version' || a === '-v') { args.version = true; continue; }
    if (a.startsWith('--')) {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[a.slice(2)] = true;
      } else {
        args[a.slice(2)] = next;
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  return { args, positional };
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function fetchOk(url) {
  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (err) {
    fail(`network error fetching ${url}: ${err.message}`);
  }
  if (!res.ok) fail(`${url} returned HTTP ${res.status}`);
  return res;
}

async function fetchJson(url) {
  const res = await fetchOk(url);
  return res.json();
}

async function fetchToFile(url, dest) {
  const res = await fetchOk(url);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', ...opts });
    let stderr = '';
    if (child.stderr) child.stderr.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.trim()}`));
    });
  });
}

// Try `tar -xf` first (works on Windows 10+, macOS, modern Linux with
// libarchive). Fall back to `unzip` (most Linux setups have it).
async function extractZip(src, destDir) {
  try {
    await run('tar', ['-xf', src, '-C', destDir]);
    return 'tar';
  } catch (tarErr) {
    try {
      await run('unzip', ['-o', '-q', src, '-d', destDir]);
      return 'unzip';
    } catch (unzipErr) {
      fail(
        `failed to extract zip.\n` +
        `  tar:   ${tarErr.message}\n` +
        `  unzip: ${unzipErr.message}\n` +
        `  Hint: install \`tar\` (Windows 10+, macOS, modern Linux) or \`unzip\`.`,
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────

async function cmdList({ site }) {
  const url = `${site}/skills.json`;
  const skills = await fetchJson(url);
  if (!Array.isArray(skills) || skills.length === 0) {
    console.log(dim('no skills published at') + ' ' + site);
    return;
  }

  // Compute padding from raw (non-coloured) widths.
  const rows = skills.map((s, i) => ({
    n: String(i + 1).padStart(2, '0'),
    name: s.name + (s.version ? ` ${dim('v' + s.version)}` : ''),
    desc: (s.description || '').replace(/\s+/g, ' ').slice(0, 64),
    size: formatBytes(s.size || 0),
  }));
  const nameW = Math.max(...rows.map((r) => stripAnsi(r.name).length));
  const sizeW = Math.max(...rows.map((r) => r.size.length));

  console.log('');
  console.log(`${bold('Skills')}  ${dim(site)}`);
  console.log('');
  for (const r of rows) {
    const pad = nameW - stripAnsi(r.name).length;
    console.log(
      `  ${dim(r.n)}  ${r.name}${' '.repeat(pad)}  ${dim(r.size.padStart(sizeW))}  ${dim(r.desc)}`,
    );
  }
  console.log('');
  console.log(dim(`${rows.length} skill${rows.length === 1 ? '' : 's'} — install with: `) + cyan('npx skills add <slug>'));
}

async function cmdAdd({ site, slug, dest }) {
  if (!slug) fail('usage: npx skills add <slug>');
  const url = `${site}/archives/${slug}.zip`;
  const tmp = path.join(os.tmpdir(), `skills-${process.pid}-${Date.now()}-${slug}.zip`);
  await mkdir(dest, { recursive: true });
  process.stderr.write(`${cyan('↓')} ${url}\n`);
  const bytes = await fetchToFile(url, tmp);
  process.stderr.write(`${cyan('✓')} downloaded ${formatBytes(bytes)} → extracting…\n`);
  const tool = await extractZip(tmp, dest);
  await rm(tmp, { force: true });
  const target = path.join(dest, slug);
  process.stderr.write(`${green('✓')} installed ${bold(slug)} → ${target}${path.sep} ${dim('(via ' + tool + ')')}\n`);
}

const SKILL_TEMPLATE = (name) => `---
name: ${name}
description: One sentence on what this skill does AND when an agent should pick it up. The agent only sees this string until the body loads, so be specific about *when*.
version: 0.1.0
license: Internal
tags:
  - example
---

# ${name}

What this skill does, in one paragraph.

## When to use
- Concrete trigger 1
- Concrete trigger 2

## Procedure
1. Step one.
2. Step two.
3. Step three.

## Validation
You are done when ...

## Common pitfalls
- ...
`;

async function cmdNew({ name, dir }) {
  if (!name) fail('usage: npx skills new <name>');
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    fail(
      `invalid skill name "${name}".\n` +
      `  Use lowercase letters, digits, and hyphens; must start with a letter.\n` +
      `  Example: my-skill, code-review-checklist`,
    );
  }
  const target = path.resolve(dir, name);
  let exists = false;
  try { await stat(target); exists = true; } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (exists) fail(`${target} already exists.`);

  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, 'SKILL.md'), SKILL_TEMPLATE(name), 'utf8');

  process.stderr.write(`${green('✓')} scaffolded ${bold(name)}\n`);
  console.log('');
  console.log(`  ${cyan(path.join(target, 'SKILL.md'))}`);
  console.log('');
  console.log(`  Next:`);
  console.log(`    ${dim('1.')} edit SKILL.md`);
  console.log(`    ${dim('2.')} git add ${path.relative(process.cwd(), target).replace(/\\/g, '/')} && git commit -m "skills: add ${name}"`);
  console.log(`    ${dim('3.')} git push   ${dim('# the deploy will pick up your new skill automatically')}`);
}

const HELP = `
${bold('skills')} ${dim('v' + VERSION)}  ${dim('— companion CLI for the skills directory')}

${bold('Commands')}
  ${cyan('list')}                  list all skills on the site
  ${cyan('add')} <slug>            download & install a skill into ./skills/
  ${cyan('new')} <name>            scaffold a new skill folder locally

${bold('Options')}
  ${yellow('--site')} <url>          override the site URL ${dim('(env: SKILLS_SITE_URL)')}
                        ${dim('default: ' + DEFAULT_SITE)}
  ${yellow('--dest')} <path>         where ${cyan('add')} installs   ${dim('(default: ./skills)')}
  ${yellow('--dir')}  <path>         where ${cyan('new')} scaffolds   ${dim('(default: ./skills)')}
  ${yellow('--help')}                this message
  ${yellow('--version')}             print version

${bold('Examples')}
  ${dim('# Browse what is available')}
  npx skills list

  ${dim('# Install a skill into your Claude Code skills dir')}
  npx skills add internal-deploy --dest ~/.claude/skills

  ${dim('# Author a new skill from a starter template')}
  npx skills new my-helpful-skill
  ${dim('# (then edit, git add, commit, push — Vercel rebuilds the directory)')}
`;

async function main() {
  const argv = process.argv.slice(2);
  // Pull out the first non-flag token as the subcommand, leaving the rest
  // for parseArgs. This way `--help` / `--version` work in any position.
  let cmd = null;
  const remaining = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (cmd === null && !a.startsWith('-')) {
      cmd = a;
    } else {
      remaining.push(a);
    }
  }
  const { args, positional } = parseArgs(remaining);

  if (args.version) { console.log(VERSION); return; }
  if (!cmd || args.help || cmd === 'help') {
    process.stdout.write(HELP + '\n');
    return;
  }

  const site = (args.site || process.env.SKILLS_SITE_URL || DEFAULT_SITE).replace(/\/+$/, '');

  switch (cmd) {
    case 'list':
      return cmdList({ site });
    case 'add':
      return cmdAdd({
        site,
        slug: positional[0],
        dest: path.resolve(args.dest || './skills'),
      });
    case 'new':
      return cmdNew({
        name: positional[0],
        dir: args.dir || './skills',
      });
    default:
      fail(`unknown command "${cmd}". Run \`npx skills help\` for usage.`);
  }
}

main().catch((err) => fail(err.stack || err.message || String(err)));
