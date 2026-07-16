import type { Metadata } from 'next';

import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { localizePath } from '@shopping-rescue/shared/i18n';

import { SEO_LANDING_PAGES_EN } from './seo-landing-pages.en';
import { SEO_LANDING_PAGES_FR } from './seo-landing-pages.fr';

export type { AppLocale };

export type McIssuePrefill =
  | 'suspension'
  | 'misrepresentation'
  | 'website_improvement'
  | 'product_disapproval'
  | 'none';

export interface SeoLandingPageConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  headline: string;
  subheadline: string;
  issuePrefill: McIssuePrefill;
  platformPrefill?: string;
  intro: string;
  whatItMeans: string;
  commonCauses: string[];
  checks: string[];
  faq: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export const SEO_LANDING_SLUGS = [
  'merchant-center-suspended',
  'merchant-center-misrepresentation',
  'website-needs-improvement',
  'product-disapprovals',
  'shopify-merchant-center',
] as const;

export type SeoLandingSlug = (typeof SEO_LANDING_SLUGS)[number];

const SEO_LANDING_PAGES_BY_LOCALE: Record<AppLocale, Record<SeoLandingSlug, SeoLandingPageConfig>> =
  {
    en: SEO_LANDING_PAGES_EN as Record<SeoLandingSlug, SeoLandingPageConfig>,
    fr: SEO_LANDING_PAGES_FR as Record<SeoLandingSlug, SeoLandingPageConfig>,
  };

/** @deprecated Use getSeoLandingPage(slug, locale) */
export const SEO_LANDING_PAGES = SEO_LANDING_PAGES_BY_LOCALE.en;

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function getSeoLandingPage(
  slug: string,
  locale: AppLocale = 'en',
): SeoLandingPageConfig | undefined {
  return SEO_LANDING_PAGES_BY_LOCALE[locale][slug as SeoLandingSlug];
}

export function buildSeoPagePath(slug: SeoLandingSlug, locale: AppLocale): string {
  return locale === 'fr' ? `/fr/${slug}` : `/${slug}`;
}

export function buildFreeScanHref(page: SeoLandingPageConfig, locale: AppLocale = 'en'): string {
  const base = localizePath('/free-scan', locale);
  const params = new URLSearchParams();
  if (page.issuePrefill !== 'none') {
    params.set('issue', page.issuePrefill);
  }
  if (page.platformPrefill) {
    params.set('platform', page.platformPrefill);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function buildSeoLandingMetadata(
  page: SeoLandingPageConfig,
  locale: AppLocale,
): Metadata {
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}${buildSeoPagePath(page.slug as SeoLandingSlug, locale)}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/${page.slug}`,
        fr: `${baseUrl}/fr/${page.slug}`,
      },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
    },
  };
}
