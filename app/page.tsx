import Link from 'next/link';
import { getAllSkills, formatBytes } from '@/lib/skills';
import { T } from '@/components/T';
import { SkillBrowser } from '@/components/SkillBrowser';

export const dynamic = 'force-static';

export default async function HomePage() {
  const skills = await getAllSkills();

  const totalFiles = skills.reduce((s, k) => s + k.fileCount, 0);
  const totalSize = skills.reduce((s, k) => s + k.size, 0);
  const allTags = new Set<string>();
  for (const s of skills) for (const t of s.tags) allTags.add(t);

  // Pass only what the client component needs (no rendered HTML / file lists).
  const compact = skills.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
    version: s.version,
    tags: s.tags,
    size: s.size,
    updatedAt: s.updatedAt,
  }));

  return (
    <div className="container">
      <section className="hero">
        <h1>
          <T
            en="A directory of agent skills."
            zh="AI Agent 技能目录"
          />
        </h1>
        <p>
          <T
            en={
              <>
                Reusable procedural knowledge — runbooks, review checklists,
                deploy recipes — for any agent that speaks the SKILL.md
                format. Click a skill for a one-line install, or read the{' '}
                <Link href="/docs">publishing guide</Link>.
              </>
            }
            zh={
              <>
                可复用的流程知识：应急手册、评审清单、部署套路。任何兼容
                SKILL.md 格式的 agent 都能直接使用。点开任意 skill 拿到
                一行的安装命令，或者去看
                <Link href="/docs">发布指南</Link>。
              </>
            }
          />
        </p>
      </section>

      {skills.length > 0 ? (
        <section
          className="stats"
          aria-label="Directory statistics"
          role="group"
        >
          <div className="stat">
            <span className="stat-value">{skills.length}</span>
            <span className="stat-label">
              <T en="skills" zh="技能" />
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalFiles}</span>
            <span className="stat-label">
              <T en="files" zh="文件" />
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{allTags.size}</span>
            <span className="stat-label">
              <T en="tags" zh="标签" />
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatBytes(totalSize)}</span>
            <span className="stat-label">
              <T en="total size" zh="总大小" />
            </span>
          </div>
        </section>
      ) : null}

      {skills.length === 0 ? (
        <div className="empty">
          <h3>
            <T en="No skills published yet" zh="还没有 skill 发布" />
          </h3>
          <p>
            <T
              en={
                <>
                  Drop a folder into <code>/skills</code> with a{' '}
                  <code>SKILL.md</code> inside, then commit and push.{' '}
                  <Link href="/docs">See the publishing guide →</Link>
                </>
              }
              zh={
                <>
                  在 <code>/skills</code> 下放一个含 <code>SKILL.md</code>{' '}
                  的文件夹，提交并推送即可。{' '}
                  <Link href="/docs">查看发布指南 →</Link>
                </>
              }
            />
          </p>
        </div>
      ) : (
        <SkillBrowser skills={compact} />
      )}
    </div>
  );
}
