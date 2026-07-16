import type { Metadata } from 'next';

import { SeoLandingPage } from '@/components/seo-landing-page';
import { buildSeoLandingMetadata, getSeoLandingPage } from '@/config/seo-landing-pages';

const page = getSeoLandingPage('shopify-merchant-center', 'en')!;

export const metadata: Metadata = buildSeoLandingMetadata(page, 'en');

export default function ShopifyMerchantCenterPage() {
  return <SeoLandingPage page={page} locale="en" />;
}
