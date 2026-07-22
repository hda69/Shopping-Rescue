import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  isAgencyStripeConfigured,
  isMonitoringStripeConfigured,
  isStripeConfigured,
} from '@shopping-rescue/billing';
import { PricingPageContent } from '@/components/pricing-page';
import { getMessages } from '@/config/messages';
import { buildPublicPageMetadata } from '@/lib/seo';

loadEnv();

const m = getMessages('en');

export const metadata: Metadata = buildPublicPageMetadata({
  title: m.meta.pricingTitle,
  description: m.meta.pricingDescription,
  path: '/pricing',
  locale: 'en',
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ scanId?: string }>;
}) {
  const params = await searchParams;

  return (
    <PricingPageContent
      locale="en"
      scanId={params.scanId}
      stripeReady={isStripeConfigured()}
      monitoringReady={isMonitoringStripeConfigured()}
      agencyReady={isAgencyStripeConfigured()}
    />
  );
}
