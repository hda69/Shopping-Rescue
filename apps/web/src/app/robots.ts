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
      disallow: ['/api/', '/dev/', '/print/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
