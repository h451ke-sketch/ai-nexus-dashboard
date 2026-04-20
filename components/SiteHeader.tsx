import Link from 'next/link';
import { T } from '@/components/T';
import { SettingsToggle } from '@/components/SettingsToggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>
            <T en="Skills" zh="技能库" />
          </span>
        </Link>
        <nav className="site-nav">
          <Link href="/">
            <T en="Directory" zh="目录" />
          </Link>
          <Link href="/docs">
            <T en="Docs" zh="文档" />
          </Link>
          <SettingsToggle />
        </nav>
      </div>
    </header>
  );
}
