import type { MetadataRoute } from 'next';

import { getSeoBaseUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSeoBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dev/',
        '/print/',
        '/dashboard/',
        '/fr/dashboard/',
        '/login',
        '/fr/login',
        '/signup',
        '/fr/signup',
        '/forgot-password',
        '/fr/forgot-password',
        '/reset-password',
        '/fr/reset-password',
        '/checkout/',
        '/fr/checkout/',
        '/scan/',
        '/fr/scan/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
