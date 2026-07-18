import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { isMonitoringStripeConfigured, isStripeConfigured } from '@shopping-rescue/billing';
import { PricingPageContent } from '@/components/pricing-page';
import { getMessages } from '@/config/messages';

loadEnv();

const m = getMessages('en');

export const metadata: Metadata = {
  title: m.meta.pricingTitle,
};

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
    />
  );
}
