import Link from 'next/link';
import type { Metadata } from 'next';
import { T } from '@/components/T';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Docs · Publishing skills',
  description:
    'How to author, publish and install skills on this directory.',
};

export default function DocsPage() {
  return (
    <div className="container">
      <header className="skill-header">
        <div className="breadcrumb">
          <Link href="/">
            <T en="Directory" zh="目录" />
          </Link>{' '}
          / <T en="docs" zh="文档" />
        </div>
        <h1>
          <T en="Publishing & installing skills" zh="发布与安装 Skill" />
        </h1>
        <p className="desc">
          <T
            en="This directory is a static site rendered from the repository. There is no upload form — you publish a skill by committing a folder to the /skills directory and pushing."
            zh="本目录是一个由仓库静态渲染出来的网站。没有上传表单 —— 你通过把一个文件夹提交到 /skills 目录里来发布一个 skill。"
          />
        </p>
      </header>

      {/* English version ------------------------------------------------- */}
      <article
        className="prose"
        data-i18n="en"
        lang="en"
        style={{ maxWidth: 760 }}
      >
        <h2>What is a skill?</h2>
        <p>
          A skill is a folder containing a <code>SKILL.md</code> file (and
          optionally <code>scripts/</code>, <code>references/</code>,{' '}
          <code>assets/</code>). It teaches an AI agent <em>how</em> to do
          something specific in our environment — a runbook, a checklist, a
          deploy recipe.
        </p>

        <h2>1. Author the skill</h2>
        <p>From the repo root:</p>
        <pre>
          <code>{`mkdir -p skills/my-skill
$EDITOR skills/my-skill/SKILL.md`}</code>
        </pre>

        <p>
          The minimum <code>SKILL.md</code>:
        </p>
        <pre>
          <code>{`---
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
You are done when ...`}</code>
        </pre>

        <h3>Required frontmatter</h3>
        <ul>
          <li>
            <code>name</code> — must equal the folder name. Lowercase,
            kebab-case.
          </li>
          <li>
            <code>description</code> — one sentence; this is the trigger the
            agent uses to decide whether to load the skill, so be specific
            about <strong>when</strong>.
          </li>
        </ul>

        <h3>Optional frontmatter</h3>
        <ul>
          <li>
            <code>version</code> — semver string. Shown on the directory and
            detail pages.
          </li>
          <li>
            <code>license</code> — e.g. <code>Internal</code>, <code>MIT</code>.
          </li>
          <li>
            <code>tags</code> — array of strings. Surfaces filterable badges.
          </li>
        </ul>

        <h3>Optional supporting folders</h3>
        <p>
          Anything inside the skill folder gets packed into the downloadable
          archive:
        </p>
        <ul>
          <li>
            <code>scripts/</code> — executable helpers the agent can run.
          </li>
          <li>
            <code>references/</code> — longer docs, checklists, templates
            loaded on demand.
          </li>
          <li>
            <code>assets/</code> — static templates, sample configs, diagrams.
          </li>
        </ul>

        <h2>2. Preview locally</h2>
        <pre>
          <code>{`pnpm install   # first time only
pnpm dev       # http://localhost:3000`}</code>
        </pre>
        <p>
          The pre-dev hook re-packs the archives, so the download button on
          your new skill&apos;s page will work immediately.
        </p>

        <h2>3. Publish</h2>
        <pre>
          <code>{`git checkout -b skill/my-skill
git add skills/my-skill
git commit -m "skills: add my-skill"
git push -u origin skill/my-skill`}</code>
        </pre>
        <p>
          Open a pull request. Once it merges to <code>main</code>, CI builds
          and deploys the site, and your skill appears in the directory.
        </p>

        <h2>4. Updating an existing skill</h2>
        <ul>
          <li>
            Bump <code>version</code> in the frontmatter.
          </li>
          <li>
            Edit <code>SKILL.md</code> and any supporting files.
          </li>
          <li>
            Open a PR. The directory will reflect the new version on next
            deploy.
          </li>
        </ul>

        <h2>5. Removing a skill</h2>
        <p>
          Delete the folder, commit, push. The pre-build script also drops the
          stale <code>.zip</code> from <code>public/archives/</code>.
        </p>

        <h2>Installing a skill</h2>
        <p>
          On a skill&apos;s detail page there is a <strong>Download</strong>{' '}
          button that gives you a <code>.zip</code> with the whole folder
          inside. Drop it into your agent&apos;s skills directory:
        </p>

        <h3>Claude Code</h3>
        <pre>
          <code>{`# project-local
unzip -o my-skill.zip -d .claude/skills/
# or, available across projects
unzip -o my-skill.zip -d ~/.claude/skills/`}</code>
        </pre>

        <h3>Codex / Cursor / OpenCode</h3>
        <p>
          Each agent has its own skills directory; check that agent&apos;s
          docs. Typically you unzip into a <code>skills/</code> folder at the
          project root or the agent&apos;s config dir.
        </p>

        <h3>One-liner from the terminal</h3>
        <p>
          Open any skill&apos;s detail page — the <strong>Install</strong>{' '}
          card on the right shows the exact <code>curl</code> command
          pre-filled with this site&apos;s real URL. Or build it yourself:
        </p>
        <pre>
          <code>{`SITE=https://<your-username>.github.io/<your-repo>
SKILL=my-skill
DEST=~/.claude/skills
curl -fL "$SITE/archives/$SKILL.zip" -o "/tmp/$SKILL.zip"
unzip -o "/tmp/$SKILL.zip" -d "$DEST" && rm "/tmp/$SKILL.zip"`}</code>
        </pre>

        <h2>How ranking works</h2>
        <p>
          The directory is currently sorted alphabetically by skill name. We
          intentionally do <strong>not</strong> phone home with install
          telemetry — this site is private and offline-friendly.
        </p>

        <h2>Conventions and review</h2>
        <ul>
          <li>
            Keep <code>SKILL.md</code> short — under ~200 lines. Push detail
            into <code>references/</code>.
          </li>
          <li>
            The <code>description</code> must say both <em>what</em> and{' '}
            <em>when</em>. The agent only sees the description until it loads
            the body.
          </li>
          <li>
            Treat scripts as code: review before merging, no embedded secrets.
          </li>
        </ul>

        <h2>FAQ</h2>
        <h3>Can I publish from a different repo?</h3>
        <p>
          Not yet. For now the skills directory and the site live in the same
          repo so review and deploy are atomic. If you have a strong case for
          mirroring a separate repo, open an issue.
        </p>

        <h3>Where do downloads come from?</h3>
        <p>
          They are static <code>.zip</code> files at{' '}
          <code>/archives/&lt;slug&gt;.zip</code>, generated by{' '}
          <code>scripts/build-archives.mjs</code> as a <code>prebuild</code>{' '}
          step. No backend, no signed URLs.
        </p>

        <h3>How do I get help?</h3>
        <p>
          Ping <code>#dev-skills</code> on Slack or open an issue in this repo.
        </p>
      </article>

      {/* Chinese version ------------------------------------------------- */}
      <article
        className="prose"
        data-i18n="zh"
        lang="zh"
        style={{ maxWidth: 760 }}
      >
        <h2>什么是 skill？</h2>
        <p>
          一个 skill 就是一个文件夹，里面有一个 <code>SKILL.md</code> 文件
          （可选还可以有 <code>scripts/</code>、<code>references/</code>、
          <code>assets/</code>）。它教会一个 AI agent 在我们的环境里
          <em>怎么</em>做一件特定的事 —— 应急手册、检查清单、部署流程都行。
        </p>

        <h2>1. 写 skill</h2>
        <p>在仓库根目录执行：</p>
        <pre>
          <code>{`mkdir -p skills/my-skill
$EDITOR skills/my-skill/SKILL.md`}</code>
        </pre>

        <p>
          最小化的 <code>SKILL.md</code>：
        </p>
        <pre>
          <code>{`---
name: my-skill
description: 一句话说清这个 skill 干啥、什么时候应该被 agent 加载。
version: 0.1.0
license: Internal
tags:
  - example
---

# my-skill

这个 skill 干嘛的。

## When to use（什么时候用）
- ...

## Procedure（步骤）
1. ...

## Validation（怎么算完成）
当 ... 时即完成。`}</code>
        </pre>

        <h3>必填的 frontmatter 字段</h3>
        <ul>
          <li>
            <code>name</code> —— 必须等于文件夹名。小写 + 短横线（kebab-case）。
          </li>
          <li>
            <code>description</code> —— 一句话；这是 agent 用来判断要不要加载
            这个 skill 的触发器，所以一定要写清楚<strong>什么时候</strong>用。
          </li>
        </ul>

        <h3>可选的 frontmatter 字段</h3>
        <ul>
          <li>
            <code>version</code> —— semver 版本号。会显示在目录和详情页。
          </li>
          <li>
            <code>license</code> —— 例如 <code>Internal</code>、
            <code>MIT</code>。
          </li>
          <li>
            <code>tags</code> —— 字符串数组，会渲染为可筛选的标签。
          </li>
        </ul>

        <h3>可选的支持文件夹</h3>
        <p>skill 文件夹里的所有内容都会被打进可下载的 zip 包里：</p>
        <ul>
          <li>
            <code>scripts/</code> —— agent 可执行的辅助脚本。
          </li>
          <li>
            <code>references/</code> —— 较长的文档、检查清单、模板，按需加载。
          </li>
          <li>
            <code>assets/</code> —— 静态模板、示例配置、图表。
          </li>
        </ul>

        <h2>2. 本地预览</h2>
        <pre>
          <code>{`pnpm install   # 第一次需要装依赖
pnpm dev       # http://localhost:3000`}</code>
        </pre>
        <p>
          <code>predev</code> 钩子会自动重打 zip 包，所以你新 skill 详情页上的
          下载按钮在本地就能用。
        </p>

        <h2>3. 发布</h2>
        <pre>
          <code>{`git checkout -b skill/my-skill
git add skills/my-skill
git commit -m "skills: add my-skill"
git push -u origin skill/my-skill`}</code>
        </pre>
        <p>
          开一个 PR。合并到 <code>main</code> 之后，CI 会自动构建并部署，
          你的 skill 就会出现在目录里。
        </p>

        <h2>4. 更新一个已有的 skill</h2>
        <ul>
          <li>
            把 frontmatter 里的 <code>version</code> 升一下。
          </li>
          <li>
            修改 <code>SKILL.md</code> 和相关支持文件。
          </li>
          <li>开 PR。下次部署后目录会显示新版本。</li>
        </ul>

        <h2>5. 删除一个 skill</h2>
        <p>
          直接删文件夹，commit，push。prebuild 脚本会顺便把
          <code>public/archives/</code> 里过期的 <code>.zip</code> 一并清掉。
        </p>

        <h2>怎么安装一个 skill</h2>
        <p>
          每个 skill 详情页上都有一个 <strong>Download</strong> 按钮，点了会
          给你一个 <code>.zip</code> 包，里面就是整个 skill 文件夹。把它解到
          你的 agent 的 skills 目录里就行：
        </p>

        <h3>Claude Code</h3>
        <pre>
          <code>{`# 项目级
unzip -o my-skill.zip -d .claude/skills/
# 或者跨项目可用
unzip -o my-skill.zip -d ~/.claude/skills/`}</code>
        </pre>

        <h3>Codex / Cursor / OpenCode</h3>
        <p>
          每个 agent 的 skills 目录位置不一样，参考它们各自的文档。一般是
          解到项目根的 <code>skills/</code> 或者 agent 的配置目录里。
        </p>

        <h3>命令行一行搞定</h3>
        <p>
          打开任意一个 skill 详情页 —— 右边的 <strong>安装</strong>{' '}
          卡片里就有已经填好这个站点真实 URL 的 <code>curl</code> 命令。
          或者自己拼：
        </p>
        <pre>
          <code>{`SITE=https://<你的用户名>.github.io/<仓库名>
SKILL=my-skill
DEST=~/.claude/skills
curl -fL "$SITE/archives/$SKILL.zip" -o "/tmp/$SKILL.zip"
unzip -o "/tmp/$SKILL.zip" -d "$DEST" && rm "/tmp/$SKILL.zip"`}</code>
        </pre>

        <h2>排序规则</h2>
        <p>
          目录目前按 skill 名称字母序排列。我们故意<strong>不</strong>收集
          安装遥测数据 —— 这个站是私有的、可离线使用的。
        </p>

        <h2>约定与审核</h2>
        <ul>
          <li>
            <code>SKILL.md</code> 保持简短 —— 大约 200 行以内。详细内容塞到
            <code>references/</code>。
          </li>
          <li>
            <code>description</code> 必须同时说清<em>是什么</em>和
            <em>什么时候用</em>。在加载正文之前 agent 只能看到 description。
          </li>
          <li>把 scripts 当成代码对待：合并前必须 review，不准内嵌密钥。</li>
        </ul>

        <h2>FAQ</h2>
        <h3>能从别的仓库发布吗？</h3>
        <p>
          暂时不行。目前 skill 目录和站点代码在同一个仓库里，这样审核和部署
          是原子的。如果你有强需求要镜像独立仓库，开 issue 讨论。
        </p>

        <h3>下载文件从哪儿来的？</h3>
        <p>
          它们是放在 <code>/archives/&lt;slug&gt;.zip</code> 的静态文件，由
          <code>scripts/build-archives.mjs</code> 在 <code>prebuild</code>{' '}
          阶段生成。没有后端，也没有签名 URL。
        </p>

        <h3>遇到问题找谁？</h3>
        <p>
          在 Slack 上 ping <code>#dev-skills</code>，或者在本仓库开 issue。
        </p>
      </article>
    </div>
  );
}
