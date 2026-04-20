import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Clock,
  FileText,
  HardDrive,
  Package,
  Scale,
  Tag,
} from 'lucide-react';
import {
  getAllSkills,
  getSkillBySlug,
  formatBytes,
  formatRelative,
} from '@/lib/skills';
import { T } from '@/components/T';
import { SkillInstall } from '@/components/SkillInstall';
import { SkillToc } from '@/components/SkillToc';

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
          </Link>
          <span aria-hidden>/</span>
          <span className="mono">{skill.slug}</span>
        </div>
        <h1>{skill.name}</h1>
        <p className="desc">{skill.description}</p>

        <div className="metadata-strip" aria-label="Skill metadata">
          {skill.version ? (
            <span className="ver">
              <Package size={11} aria-hidden />v{skill.version}
            </span>
          ) : null}
          {skill.license ? (
            <span>
              <Scale size={12} aria-hidden />
              {skill.license}
            </span>
          ) : null}
          <span>
            <FileText size={12} aria-hidden />
            <T
              en={`${skill.fileCount} file${skill.fileCount === 1 ? '' : 's'}`}
              zh={`${skill.fileCount} 个文件`}
            />
          </span>
          <span>
            <HardDrive size={12} aria-hidden />
            {formatBytes(skill.size)}
          </span>
          <span>
            <Clock size={12} aria-hidden />
            <T
              en={`updated ${formatRelative(skill.updatedAt)}`}
              zh={`更新于 ${formatRelative(skill.updatedAt)}`}
            />
          </span>
          {skill.tags.length > 0 ? (
            <span>
              <Tag size={12} aria-hidden />
              {skill.tags.join(' · ')}
            </span>
          ) : null}
        </div>
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

          <SkillToc headings={skill.headings} />

          {skill.fileCount > 1 ? (
            <div className="aside-card">
              <h4>
                <T en={`Files (${skill.fileCount})`} zh={`文件列表 (${skill.fileCount})`} />
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
          ) : null}
        </aside>
      </div>
    </div>
  );
}
