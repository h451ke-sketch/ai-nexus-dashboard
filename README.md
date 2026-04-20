# Skills

A self-hosted directory for AI agent skills — modeled on
[skills.sh](https://skills.sh) but with **no backend and no database**.
Skills are folders in this repo; the site is rebuilt and redeployed every
time someone pushes a change.

```
┌────────────────────────────────────────────────────────┐
│  /skills/<slug>/SKILL.md  ←  source of truth (git)      │
│            │                                            │
│            ▼                                            │
│  pnpm build                                             │
│   ├─ scripts/build-archives.mjs  →  public/archives/*.zip│
│   └─ next build (output: 'export') →  out/ (static html)│
│            │                                            │
│            ▼                                            │
│  static hosting (GitHub Pages / Nginx / S3 / Vercel)    │
└────────────────────────────────────────────────────────┘
```

## Stack

- Next.js 16 (App Router, `output: 'export'` — pure static, no Node at serve time)
- `gray-matter` to parse `SKILL.md` frontmatter
- `marked` to render skill bodies
- `archiver` to build `.zip` per skill at build time
- `lucide-react` for the toggle icons
- No database. No auth. No API routes.

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

`pnpm dev` triggers `predev`, which runs `scripts/build-archives.mjs` and packs
every folder under `/skills` into `/public/archives/<slug>.zip` so the
**Download** button on each skill page works locally too.

To rebuild the archives without starting the dev server:

```bash
pnpm archives
```

## Publishing a skill

> **TL;DR**: drop a folder into `/skills`, push, the site picks it up.

1. **Create the skill folder** at the repo root:

   ```bash
   mkdir -p skills/my-skill
   ```

2. **Write `SKILL.md`** with at minimum a `name` and `description` in the
   YAML frontmatter:

   ```markdown
   ---
   name: my-skill
   description: One sentence on what the skill does and when an agent should pick it up.
   version: 0.1.0
   license: Internal
   tags:
     - example
   ---

   # my-skill

   What this skill does.

   ## When to use
   - ...

   ## Procedure
   1. ...

   ## Validation
   You are done when ...
   ```

   Rules:
   - `name` **must equal the folder name** and be lowercase / kebab-case.
   - `description` is the trigger the agent uses to decide whether to load the
     skill. Be specific about *when* to invoke it.

3. (Optional) Add supporting files alongside `SKILL.md`. Common layouts:

   ```
   skills/my-skill/
   ├── SKILL.md
   ├── scripts/        # executable helpers
   ├── references/     # longer docs / templates loaded on demand
   └── assets/         # static templates, sample configs, diagrams
   ```

4. **Preview**:

   ```bash
   pnpm dev
   # open http://localhost:3000/my-skill
   ```

5. **Open a PR** against `main`. Once it merges, CI builds & deploys, and the
   skill shows up in the directory.

### Updating a skill

- Bump `version` in the frontmatter.
- Edit `SKILL.md` (and any supporting files).
- Open a PR.

### Removing a skill

- Delete the folder, commit, push.
- The pre-build script also drops the stale `.zip` from `public/archives/`.

## CLI (`npx skills …`)

A small companion CLI ships in `bin/cli.mjs`. It uses only Node built-ins
plus the system `tar`/`unzip`, so `npx` doesn't need to install heavy
dependencies for it to run.

```bash
# Browse what's published
npx -p github:<owner>/<repo> skills list

# Install a skill into your Claude Code skills directory
npx -p github:<owner>/<repo> skills add internal-deploy --dest ~/.claude/skills

# Scaffold a new skill folder locally with a starter SKILL.md
npx -p github:<owner>/<repo> skills new my-helpful-skill
```

After cloning the repo you can shorten that to:

```bash
pnpm cli list
pnpm cli add internal-deploy
pnpm cli new my-helpful-skill
```

Or, after `pnpm install`:

```bash
pnpm exec skills list
```

The CLI reads the site URL from (in order): `--site <url>` flag,
`SKILLS_SITE_URL` env var, then the default baked into `bin/cli.mjs`. Adjust
the default in `cli.mjs` to your own deployment.

### Publishing a skill via the CLI

There is no dedicated `publish` subcommand because the underlying mechanism
is just `git push`. Use `npx skills new <name>` from the repo root to scaffold
a folder under `skills/`, edit `SKILL.md`, then commit and push — the next
deploy picks it up.

## Installing a skill (consumer side)

Each skill page on the site exposes a `Download` button that gives you a
`.zip` containing the whole skill folder. Drop it into your agent's skills
directory:

### Claude Code

```bash
# project-local
unzip -o my-skill.zip -d .claude/skills/

# or, available across all projects
unzip -o my-skill.zip -d ~/.claude/skills/
```

### One-liner from the terminal

Open any skill's page — the **Install** card on the right shows the exact
`curl` command pre-filled with the site's actual URL (computed at runtime
from `window.location`, so it works regardless of where you deployed). Or
build it yourself:

```bash
SITE=https://<your-username>.github.io/<your-repo>
SKILL=my-skill
DEST=~/.claude/skills
curl -fL "$SITE/archives/$SKILL.zip" -o "/tmp/$SKILL.zip"
unzip -o "/tmp/$SKILL.zip" -d "$DEST" && rm "/tmp/$SKILL.zip"
```

### Codex / Cursor / OpenCode

Each agent has its own skills directory; check that agent's docs. Typically
you unzip into a `skills/` folder at the project root or in the agent's
config dir.

## Deployment

`pnpm build` produces a fully self-contained `out/` directory thanks to
`output: 'export'` in `next.config.ts`. Drop `out/` on any static host.

### Vercel (recommended)

Vercel auto-detects everything in this repo:

1. Import the repo at <https://vercel.com/new>, or — if the project is
   already linked — just `git push`.
2. Vercel runs `pnpm install` then `pnpm build` (which packs every skill
   into `public/archives/*.zip` before exporting).
3. The site is live at `https://<your-project>.vercel.app/`.

No env vars to set. The install commands shown to visitors are built
from `window.location` at runtime, so they automatically use your Vercel
domain (or your custom domain if you wire one up later in Project
Settings → Domains).

### Nginx / S3 / Cloudflare Pages / a USB stick

```bash
pnpm build
# upload everything inside ./out/ to your bucket / web root.
```

Map every directory request to its `index.html` if your host doesn't do
that by default. Most do.

### GitHub Pages (subpath hosting)

If you ever want to host this as `https://<user>.github.io/<repo>/`, set
`NEXT_BASE_PATH=/<repo>` before running `pnpm build` and upload `out/`.
`next.config.ts` already wires the env var through to both the framework
and the client-side install snippet so URLs stay correct on the subpath.

### Local preview of the built site

```bash
pnpm build
npx serve out
```

## Project layout

```
.
├── app/
│   ├── [slug]/page.tsx     # skill detail page
│   ├── docs/page.tsx       # publishing & install docs (bilingual)
│   ├── globals.css         # design tokens + light/dark + lang show/hide
│   ├── layout.tsx
│   └── page.tsx            # directory home
├── components/
│   ├── SettingsToggle.tsx  # theme + language switcher (client)
│   ├── SiteFooter.tsx
│   ├── SiteHeader.tsx
│   ├── SkillInstall.tsx    # install snippet for one skill, URL from window.location
│   └── T.tsx               # bilingual text wrapper (renders both, CSS hides one)
├── lib/
│   └── skills.ts           # filesystem reader + frontmatter parser
├── scripts/
│   └── build-archives.mjs  # zip every /skills/* into /public/archives/
├── skills/                 # ← all published skills live here
│   ├── incident-response/
│   ├── internal-deploy/
│   └── pr-review-checklist/
├── next.config.ts          # output: 'export' + optional NEXT_BASE_PATH
└── public/
    └── archives/           # generated; gitignored
```

## i18n & theming

The header has a small toggle group with two pairs of buttons:

- **Theme** — dark (default) / light. Sets `<html data-theme="…">`. CSS
  variables in `app/globals.css` swap; nothing re-renders.
- **Language** — EN (default) / 中. Sets `<html data-lang="…">`. Both
  language strings are rendered to the DOM via `<T en zh>`; CSS hides the
  inactive one.

Preferences are persisted to `localStorage` and applied via a tiny
`beforeInteractive` script in `app/layout.tsx` to avoid theme/lang flash on
first paint.

Skill content (the `SKILL.md` body) is **not** translated — it's user content
authored in whatever language the skill author chose.

## What this is not

- It does **not** implement the `npx skills` CLI protocol used by skills.sh.
  Anyone can grab the `.zip` directly via the download button or the
  `/archives/<slug>.zip` URL.
- It does **not** record install telemetry. The directory is sorted
  alphabetically.
- It does **not** support uploading via a web form. All publishing happens
  through git, so review and audit trail come for free.
