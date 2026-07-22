import type { Metadata } from 'next';

import { HomePageContent } from '@/components/home-page';
import { JsonLd } from '@/components/json-ld';
import { getMessages } from '@/config/messages';
import { buildPublicPageMetadata, getSeoBaseUrl } from '@/lib/seo';

const m = getMessages('en');
const baseUrl = getSeoBaseUrl();

export const metadata: Metadata = buildPublicPageMetadata({
  title: m.meta.homeTitle,
  description: m.meta.homeDescription,
  path: '/',
  locale: 'en',
  absoluteTitle: true,
  keywords: [
    'Google Merchant Center',
    'account suspension',
    'misrepresentation',
    'product disapprovals',
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Shopping Rescue',
          url: baseUrl,
          logo: `${baseUrl}/logo-icon.png`,
          description: m.meta.homeDescription,
          sameAs: [],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Shopping Rescue',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: baseUrl,
          description: m.meta.homeDescription,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            description: 'Free Merchant Center diagnostic scan',
          },
        }}
      />
      <HomePageContent locale="en" />
    </>
  );
}
