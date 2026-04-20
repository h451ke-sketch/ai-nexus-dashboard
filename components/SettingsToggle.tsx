'use client';

import { useSyncExternalStore } from 'react';

export const THEME_KEY = 'cs.theme';
export const LANG_KEY = 'cs.lang';

export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'zh';

const themeListeners = new Set<() => void>();
const langListeners = new Set<() => void>();

function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  return () => {
    themeListeners.delete(cb);
  };
}

function subscribeLang(cb: () => void) {
  langListeners.add(cb);
  return () => {
    langListeners.delete(cb);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const v = document.documentElement.getAttribute('data-theme');
  return v === 'light' ? 'light' : 'dark';
}

function getLangSnapshot(): Lang {
  if (typeof document === 'undefined') return 'en';
  const v = document.documentElement.getAttribute('data-lang');
  return v === 'zh' ? 'zh' : 'en';
}

const getServerThemeSnapshot = (): Theme => 'dark';
const getServerLangSnapshot = (): Lang => 'en';

function applyTheme(next: Theme) {
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  themeListeners.forEach((cb) => cb());
}

function applyLang(next: Lang) {
  document.documentElement.setAttribute('data-lang', next);
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    /* ignore */
  }
  langListeners.forEach((cb) => cb());
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
}

export function useLang(): Lang {
  return useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getServerLangSnapshot,
  );
}

export function SettingsToggle() {
  const theme = useTheme();
  const lang = useLang();

  return (
    <div
      className="settings-toggle"
      role="group"
      aria-label="Display settings"
      suppressHydrationWarning
    >
      <span className="settings-group">
        <button
          type="button"
          aria-pressed={theme === 'dark'}
          onClick={() => applyTheme('dark')}
          title="Dark theme"
        >
          <MoonIcon />
        </button>
        <button
          type="button"
          aria-pressed={theme === 'light'}
          onClick={() => applyTheme('light')}
          title="Light theme"
        >
          <SunIcon />
        </button>
      </span>
      <span className="settings-group">
        <button
          type="button"
          aria-pressed={lang === 'en'}
          onClick={() => applyLang('en')}
          title="English"
        >
          EN
        </button>
        <button
          type="button"
          aria-pressed={lang === 'zh'}
          onClick={() => applyLang('zh')}
          title="中文"
        >
          中
        </button>
      </span>
    </div>
  );
}
