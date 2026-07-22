import type { MetadataRoute } from 'next';

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

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
