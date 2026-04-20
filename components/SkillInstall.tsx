'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { T } from '@/components/T';
import { useLang } from '@/components/SettingsToggle';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// `window.location.origin` doesn't change for the lifetime of a page, so
// `subscribe` is a no-op. We use useSyncExternalStore (instead of
// useEffect+setState) to keep the SSR snapshot consistent and let React
// pick up the real value after hydration without tripping the
// "no setState in effect" lint rule.
const subscribe = () => () => {};
const getOrigin = () =>
  typeof window === 'undefined' ? 'https://YOUR-SITE' : window.location.origin;
const getServerOrigin = () => 'https://YOUR-SITE';

/**
 * Renders the install snippet for a single skill, computing the absolute
 * download URL from `window.location.origin` at runtime. That way the
 * command shown to the user is always correct for whichever URL they are
 * currently visiting — no `<your-domain>` placeholder to find-and-replace.
 */
export function SkillInstall({ slug }: { slug: string }) {
  const lang = useLang();
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const [copied, setCopied] = useState(false);

  const archiveUrl = `${origin}${BASE_PATH}/archives/${slug}.zip`;
  const downloadHref = `${BASE_PATH}/archives/${slug}.zip`;

  const command = `# Download and unpack into your agent's skills dir
curl -fL -o ${slug}.zip "${archiveUrl}"
unzip -o ${slug}.zip -d ~/.claude/skills/
rm ${slug}.zip`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard might be unavailable on http or sandboxed contexts */
    }
  };

  return (
    <>
      <pre className="install-snippet">{command}</pre>
      <div className="row gap-sm" style={{ width: '100%' }}>
        <a
          className="btn btn-primary"
          href={downloadHref}
          download={`${slug}.zip`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Download size={14} />
          <T en={`Download ${slug}.zip`} zh={`下载 ${slug}.zip`} />
        </a>
        <button
          type="button"
          className="btn"
          onClick={onCopy}
          aria-label={lang === 'zh' ? '复制命令' : 'copy command'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </>
  );
}
