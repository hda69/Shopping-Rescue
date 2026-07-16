import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { isStripeConfigured } from '@shopping-rescue/billing';
import { PricingPageContent } from '@/components/pricing-page';
import { getMessages } from '@/config/messages';

loadEnv();

const m = getMessages('fr');

export const metadata: Metadata = {
  title: m.meta.pricingTitle,
  alternates: {
    canonical: '/fr/pricing',
    languages: {
      en: '/pricing',
      fr: '/fr/pricing',
    },
  },
};

export default async function FrenchPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ scanId?: string }>;
}) {
  const params = await searchParams;

  return (
    <PricingPageContent locale="fr" scanId={params.scanId} stripeReady={isStripeConfigured()} />
  );
}
