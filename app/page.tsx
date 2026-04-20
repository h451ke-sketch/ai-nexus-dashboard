import Link from 'next/link';
import { getAllSkills, formatBytes, formatRelative } from '@/lib/skills';
import { T } from '@/components/T';

export const dynamic = 'force-static';

export default async function HomePage() {
  const skills = await getAllSkills();

  return (
    <div className="container">
      <section className="hero">
        <h1>
          <T en="The skills directory." zh="Skill 目录" />
        </h1>
        <p>
          <T
            en={
              <>
                Reusable procedural knowledge for our AI agents — runbooks,
                review checklists, deployment recipes. Each skill is a folder
                of markdown that any compatible agent (Claude Code, Codex,
                Cursor, OpenCode, …) can load on demand. Click any skill below
                for the one-line install command, or read the{' '}
                <Link href="/docs">publishing guide</Link>.
              </>
            }
            zh={
              <>
                为我们的 AI agent 准备的可复用流程知识 —— 应急手册、评审清单、
                部署套路。每个 skill 是一个 markdown 文件夹，任何兼容的 agent
                （Claude Code、Codex、Cursor、OpenCode……）都能按需加载。点开
                下面任意一个 skill 拿到一行的安装命令，或者去看
                <Link href="/docs">发布指南</Link>。
              </>
            }
          />
        </p>
      </section>

      <section>
        <div className="section-head">
          <h2>
            <T en="Skills directory" zh="Skill 目录" />
          </h2>
          <span className="meta">
            <T
              en={`${skills.length} skill${skills.length === 1 ? '' : 's'}`}
              zh={`共 ${skills.length} 个 skill`}
            />
          </span>
        </div>

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
          <ol className="skill-list">
            {skills.map((s, i) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="skill-row">
                  <span className="skill-rank">{i + 1}</span>
                  <div className="skill-main">
                    <h3>
                      {s.name}
                      <span className="slug">/{s.slug}</span>
                    </h3>
                    <p>
                      {s.description || (
                        <T en="No description." zh="暂无描述。" />
                      )}
                    </p>
                    {s.tags.length > 0 ? (
                      <div className="tag-row">
                        {s.tags.slice(0, 5).map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="skill-side">
                    {s.version ? <span className="ver">v{s.version}</span> : null}
                    <span>{formatBytes(s.size)}</span>
                    <span>
                      <T
                        en={`updated ${formatRelative(s.updatedAt)}`}
                        zh={`更新于 ${formatRelative(s.updatedAt)}`}
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

