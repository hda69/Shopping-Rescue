import type { Metadata } from 'next';

import { SeoLandingPage } from '@/components/seo-landing-page';
import { buildSeoLandingMetadata, getSeoLandingPage } from '@/config/seo-landing-pages';

const page = getSeoLandingPage('merchant-center-misrepresentation', 'en')!;

export const metadata: Metadata = buildSeoLandingMetadata(page, 'en');

export default function MerchantCenterMisrepresentationPage() {
  return <SeoLandingPage page={page} locale="en" />;
}
