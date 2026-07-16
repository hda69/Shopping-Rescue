import type { MetadataRoute } from 'next';

import { buildSeoPagePath, SEO_LANDING_SLUGS } from '@/config/seo-landing-pages';

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes = [
    '',
    '/pricing',
    '/free-scan',
    '/legal/terms',
    '/legal/privacy',
    '/legal/disclaimer',
    '/fr/legal/terms',
    '/fr/legal/privacy',
    '/fr/legal/disclaimer',
    '/fr',
    '/fr/pricing',
    '/fr/free-scan',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...SEO_LANDING_SLUGS.flatMap((slug) => [
      {
        url: `${baseUrl}${buildSeoPagePath(slug, 'en')}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}${buildSeoPagePath(slug, 'fr')}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
    ]),
  ];
}
