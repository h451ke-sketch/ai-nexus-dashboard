import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllSkills,
  getSkillBySlug,
  formatBytes,
  formatRelative,
} from '@/lib/skills';
import { T } from '@/components/T';
import { SkillInstall } from '@/components/SkillInstall';

type Params = Promise<{ slug: string }>;

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const skills = await getAllSkills();
  return skills.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) return { title: 'Not found' };
  return {
    title: skill.name,
    description: skill.description,
  };
}

export default async function SkillPage({ params }: { params: Params }) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) notFound();

  return (
    <div className="container">
      <header className="skill-header">
        <div className="breadcrumb">
          <Link href="/">
            <T en="Directory" zh="目录" />
          </Link>{' '}
          / <span className="mono">{skill.slug}</span>
        </div>
        <h1>{skill.name}</h1>
        <p className="desc">{skill.description}</p>
        {skill.tags.length > 0 ? (
          <div className="tag-row" style={{ marginTop: '0.75rem' }}>
            {skill.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="skill-detail">
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: skill.bodyHtml }}
        />

        <aside className="skill-aside">
          <div className="aside-card">
            <h4>
              <T en="Install" zh="安装" />
            </h4>
            <SkillInstall slug={skill.slug} />
          </div>

          <div className="aside-card">
            <h4>
              <T en="Metadata" zh="元数据" />
            </h4>
            <dl>
              <dt>
                <T en="name" zh="名称" />
              </dt>
              <dd>{skill.name}</dd>
              <dt>
                <T en="version" zh="版本" />
              </dt>
              <dd>{skill.version ?? '—'}</dd>
              <dt>
                <T en="license" zh="协议" />
              </dt>
              <dd>{skill.license ?? '—'}</dd>
              <dt>
                <T en="files" zh="文件数" />
              </dt>
              <dd>{skill.fileCount}</dd>
              <dt>
                <T en="size" zh="体积" />
              </dt>
              <dd>{formatBytes(skill.size)}</dd>
              <dt>
                <T en="updated" zh="更新" />
              </dt>
              <dd>{formatRelative(skill.updatedAt)}</dd>
            </dl>
          </div>

          <div className="aside-card">
            <h4>
              <T en="Files" zh="文件列表" />
            </h4>
            <ul className="file-tree">
              {skill.files.map((f) => (
                <li key={f.path}>
                  <span>{f.path}</span>
                  <span className="size">{formatBytes(f.size)}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
