'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { T } from '@/components/T';
import { useLang } from '@/components/SettingsToggle';

type Item = {
  slug: string;
  name: string;
  description: string;
  version: string | null;
  tags: string[];
  size: number;
  updatedAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatRelative(iso: string, lang: 'en' | 'zh'): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (lang === 'zh') {
    if (diff < day) return '今天';
    if (diff < 2 * day) return '昨天';
    if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;
    if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} 个月前`;
    return `${Math.floor(diff / (365 * day))} 年前`;
  }
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  if (diff < 30 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} months ago`;
  return `${Math.floor(diff / (365 * day))} years ago`;
}

export function SkillBrowser({ skills }: { skills: Item[] }) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const lang = useLang();

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) {
      for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (activeTags.size > 0) {
        for (const t of activeTags) if (!s.tags.includes(t)) return false;
      }
      if (q) {
        const haystack = `${s.name} ${s.slug} ${s.description} ${s.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [skills, query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <>
      <div className="browse-toolbar">
        <div className="search-input">
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'zh' ? '按名称、描述、标签搜索…' : 'Search by name, description, tag…'}
            aria-label={lang === 'zh' ? '搜索 skill' : 'Search skills'}
          />
          {query ? (
            <button
              type="button"
              className="btn-icon"
              onClick={() => setQuery('')}
              style={{ width: 24, height: 24 }}
              aria-label={lang === 'zh' ? '清除' : 'Clear'}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        {tagCounts.length > 0 ? (
          <div className="tag-filters" role="group" aria-label="Filter by tag">
            {tagCounts.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className="tag-chip"
                aria-pressed={activeTags.has(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <span className="count">{count}</span>
              </button>
            ))}
            {activeTags.size > 0 ? (
              <button
                type="button"
                className="tag-chip"
                onClick={() => setActiveTags(new Set())}
                title={lang === 'zh' ? '清空筛选' : 'Clear filters'}
              >
                <X size={11} />
                <T en="clear" zh="清空" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="section-head">
        <h2>
          <T en="Skills directory" zh="Skill 目录" />
        </h2>
        <span className="meta">
          <T
            en={
              filtered.length === skills.length
                ? `${skills.length} skill${skills.length === 1 ? '' : 's'}`
                : `${filtered.length} of ${skills.length}`
            }
            zh={
              filtered.length === skills.length
                ? `共 ${skills.length} 个`
                : `${filtered.length} / ${skills.length}`
            }
          />
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>
            <T en="No matches" zh="没有匹配结果" />
          </h3>
          <p>
            <T
              en={
                <>
                  Try a different search or clear the active filters.
                </>
              }
              zh={<>换个关键词搜搜，或清空已选筛选项。</>}
            />
          </p>
        </div>
      ) : (
        <ol className="skill-list">
          {filtered.map((s, i) => (
            <li key={s.slug}>
              <Link href={`/${s.slug}`} className="skill-row">
                <span className="skill-rank">{(i + 1).toString().padStart(2, '0')}</span>
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
                  <span>{formatRelative(s.updatedAt, lang)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
