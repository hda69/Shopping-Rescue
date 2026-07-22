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

const m = getMessages('fr');

export const metadata: Metadata = buildPublicPageMetadata({
  title: m.meta.pricingTitle,
  description: m.meta.pricingDescription,
  path: '/pricing',
  locale: 'fr',
});

export default async function FrenchPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ scanId?: string }>;
}) {
  const params = await searchParams;

  return (
    <PricingPageContent
      locale="fr"
      scanId={params.scanId}
      stripeReady={isStripeConfigured()}
      monitoringReady={isMonitoringStripeConfigured()}
      agencyReady={isAgencyStripeConfigured()}
    />
  );
}
