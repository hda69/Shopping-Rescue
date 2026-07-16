import type { Metadata } from 'next';

import { SeoLandingPage } from '@/components/seo-landing-page';
import { buildSeoLandingMetadata, getSeoLandingPage } from '@/config/seo-landing-pages';

const page = getSeoLandingPage('website-needs-improvement', 'en')!;

export const metadata: Metadata = buildSeoLandingMetadata(page, 'en');

export default function WebsiteNeedsImprovementPage() {
  return <SeoLandingPage page={page} locale="en" />;
}
