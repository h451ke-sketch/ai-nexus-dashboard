import Link from 'next/link';
import { T } from '@/components/T';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>
          <T
            en="A self-hosted directory of AI agent skills · static site, no backend"
            zh="自托管的 AI agent 技能目录 · 纯静态站，无后端"
          />
        </span>
        <span className="row gap-sm">
          <Link href="/docs">
            <T en="Publish a skill →" zh="发布一个 skill →" />
          </Link>
        </span>
      </div>
    </footer>
  );
}
