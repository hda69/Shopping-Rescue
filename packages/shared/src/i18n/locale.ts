export type AppLocale = 'en' | 'fr';

export const DEFAULT_LOCALE: AppLocale = 'en';

export function parseLocaleParam(value: string | null | undefined): AppLocale {
  return value === 'fr' ? 'fr' : 'en';
}

export function localizePath(path: string, locale: AppLocale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') return normalized;
  if (normalized === '/') return '/fr';
  if (normalized === '/fr' || normalized.startsWith('/fr/')) return normalized;
  return `/fr${normalized}`;
}
