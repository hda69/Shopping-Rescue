import type { Metadata } from 'next';

import { getAppBaseUrl } from '@/lib/app-url';
import { localizePath, type AppLocale } from '@/lib/locale';

export function getSeoBaseUrl(): string {
  const fromEnv = getAppBaseUrl();
  if (fromEnv.includes('localhost') && process.env.NODE_ENV === 'production') {
    return 'https://shoppingrescue.app';
  }
  return fromEnv;
}

/** Locale alternates for a path like `/pricing` (without locale prefix). */
export function buildLanguageAlternates(path: string = '/'): NonNullable<Metadata['alternates']>['languages'] {
  const baseUrl = getSeoBaseUrl();
  const normalized = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`;
  const enPath = normalized === '/' ? '/' : normalized;
  const frPath = normalized === '/' ? '/fr' : `/fr${normalized}`;
  const enUrl = enPath === '/' ? baseUrl : `${baseUrl}${enPath}`;

  return {
    en: enUrl,
    fr: `${baseUrl}${frPath}`,
    'x-default': enUrl,
  };
}

export function buildPageAlternates(
  path: string,
  locale: AppLocale,
): NonNullable<Metadata['alternates']> {
  const baseUrl = getSeoBaseUrl();
  const languages = buildLanguageAlternates(path);
  const canonicalPath = localizePath(path === '/' ? '/' : path, locale);
  const canonical = canonicalPath === '/' ? baseUrl : `${baseUrl}${canonicalPath}`;

  return {
    canonical,
    languages,
  };
}

export function buildPublicPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  locale: AppLocale;
  absoluteTitle?: boolean;
  keywords?: string[];
}): Metadata {
  const { title, description, path, locale, absoluteTitle, keywords } = options;
  const baseUrl = getSeoBaseUrl();
  const canonicalPath = localizePath(path === '/' ? '/' : path, locale);
  const url = canonicalPath === '/' ? baseUrl : `${baseUrl}${canonicalPath}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: buildPageAlternates(path, locale),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Shopping Rescue',
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      images: [{ url: '/logo-icon.png', width: 512, height: 512, alt: 'Shopping Rescue' }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/logo-icon.png'],
    },
  };
}

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
