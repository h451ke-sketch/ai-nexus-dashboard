import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Skills · Agent Skills Directory',
    template: '%s · Skills',
  },
  description:
    'Browse, install, and publish reusable skills for AI agents.',
};

// Runs synchronously in the document <head> *before* React hydrates, so the
// theme and language attributes match the user's saved preference on first
// paint — no FOUC. Keep it as a tiny self-contained string.
const themeBootstrap = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('cs.theme');var l=localStorage.getItem('cs.lang');if(t!=='light'&&t!=='dark')t='dark';if(l!=='en'&&l!=='zh')l='en';d.setAttribute('data-theme',t);d.setAttribute('data-lang',l);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      data-theme="dark"
      data-lang="en"
      suppressHydrationWarning
    >
      <body>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

