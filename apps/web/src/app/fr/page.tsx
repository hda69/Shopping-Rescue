import type { Metadata } from 'next';

import { HomePageContent } from '@/components/home-page';
import { JsonLd } from '@/components/json-ld';
import { getMessages } from '@/config/messages';
import { buildPublicPageMetadata, getSeoBaseUrl } from '@/lib/seo';

const m = getMessages('fr');
const baseUrl = getSeoBaseUrl();

export const metadata: Metadata = buildPublicPageMetadata({
  title: m.meta.homeTitle,
  description: m.meta.homeDescription,
  path: '/',
  locale: 'fr',
  absoluteTitle: true,
  keywords: [
    'Google Merchant Center',
    'suspension compte',
    'misrepresentation',
    'refus produits',
  ],
});

export default function FrenchHomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Shopping Rescue',
          url: `${baseUrl}/fr`,
          logo: `${baseUrl}/logo-icon.png`,
          description: m.meta.homeDescription,
        }}
      />
      <HomePageContent locale="fr" />
    </>
  );
}
