import type { ReactNode } from 'react';

/**
 * Bilingual text helper. Renders BOTH the English and Chinese variants
 * into the DOM; CSS in globals.css hides the one that doesn't match
 * the current `<html data-lang>` value. Switching is therefore a pure
 * CSS attribute flip — no React re-render, no hydration churn.
 *
 * Use `<T>` for inline text. Use `<TBlock>` when either variant
 * contains block-level elements (paragraphs, lists, etc.) since
 * `<span>` cannot legally contain `<p>` / `<ul>` / `<pre>`.
 */
export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  return (
    <>
      <span data-i18n="en" lang="en">
        {en}
      </span>
      <span data-i18n="zh" lang="zh">
        {zh}
      </span>
    </>
  );
}

export function TBlock({
  en,
  zh,
  as: Tag = 'div',
  className,
}: {
  en: ReactNode;
  zh: ReactNode;
  as?: 'div' | 'section' | 'article';
  className?: string;
}) {
  return (
    <>
      <Tag data-i18n="en" lang="en" className={className}>
        {en}
      </Tag>
      <Tag data-i18n="zh" lang="zh" className={className}>
        {zh}
      </Tag>
    </>
  );
}
