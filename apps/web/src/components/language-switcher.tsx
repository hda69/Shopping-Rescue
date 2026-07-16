'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface LanguageSwitcherProps {
  locale: AppLocale;
  label: string;
  englishLabel: string;
  frenchLabel: string;
  variant?: 'dark' | 'light';
}

function stripFrenchPrefix(path: string): string {
  if (path === '/fr') return '/';
  if (path.startsWith('/fr/')) return path.slice(3) || '/';
  return path;
}

export function buildLocaleSwitchHrefsFromPathname(pathname: string): {
  englishHref: string;
  frenchHref: string;
} {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const base = stripFrenchPrefix(path);

  return {
    englishHref: localizePath(base, 'en'),
    frenchHref: localizePath(base, 'fr'),
  };
}

export function LanguageSwitcher({
  locale,
  label,
  englishLabel,
  frenchLabel,
  variant = 'light',
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const { englishHref, frenchHref } = buildLocaleSwitchHrefsFromPathname(pathname);
  const isDark = variant === 'dark';

  return (
    <nav
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-full px-1 py-1 text-xs font-medium ${
        isDark
          ? 'border border-white/15 bg-white/10'
          : 'border border-black/5 bg-white/60'
      }`}
    >
      <Link
        href={englishHref}
        className={
          locale === 'en'
            ? `rounded-full px-3 py-1.5 ${isDark ? 'bg-white/90 text-[#111]' : 'bg-[#111] text-white'}`
            : `rounded-full px-3 py-1.5 ${isDark ? 'text-white/70 hover:text-white' : 'text-[#6e6e73] hover:text-[#111]'}`
        }
      >
        {englishLabel}
      </Link>
      <Link
        href={frenchHref}
        className={
          locale === 'fr'
            ? `rounded-full px-3 py-1.5 ${isDark ? 'bg-white/90 text-[#111]' : 'bg-[#111] text-white'}`
            : `rounded-full px-3 py-1.5 ${isDark ? 'text-white/70 hover:text-white' : 'text-[#6e6e73] hover:text-[#111]'}`
        }
      >
        {frenchLabel}
      </Link>
    </nav>
  );
}

/** @deprecated Use buildLocaleSwitchHrefsFromPathname with the actual pathname instead. */
export function buildPublicLocaleSwitchHrefs(
  currentPath: string,
  _locale: AppLocale,
): { englishHref: string; frenchHref: string } {
  return buildLocaleSwitchHrefsFromPathname(currentPath);
}
