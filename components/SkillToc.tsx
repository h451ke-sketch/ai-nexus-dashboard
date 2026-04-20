'use client';

import { useEffect, useState } from 'react';
import { T } from '@/components/T';

type H = { id: string; text: string; level: 2 | 3 };

/**
 * Sticky table of contents derived from the SKILL.md body's h2/h3.
 * Highlights the section currently in the viewport using IntersectionObserver.
 */
export function SkillToc({ headings }: { headings: H[] }) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  );

  useEffect(() => {
    if (headings.length === 0) return;
    const targets: HTMLElement[] = [];
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) targets.push(el);
    }
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="aside-card">
      <h4>
        <T en="On this page" zh="本页内容" />
      </h4>
      <nav className="toc" aria-label="Table of contents">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={[
              h.level === 3 ? 'h3' : '',
              activeId === h.id ? 'active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              activeId === h.id
                ? { color: 'var(--fg)', borderLeftColor: 'var(--accent)' }
                : undefined
            }
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
