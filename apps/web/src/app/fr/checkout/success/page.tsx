import { loadEnv } from '@shopping-rescue/shared/load-env';
import { CheckoutSuccessPageContent } from '@/components/checkout-success-page';
import { getCheckoutScanSummary, verifyCheckoutSessionAndUnlock } from '@/lib/checkout';

loadEnv();

export const dynamic = 'force-dynamic';

export default async function FrenchCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ scanId?: string; session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <CheckoutSuccessPageContent
      locale="fr"
      scanId={params.scanId}
      sessionId={params.session_id}
      verifyCheckout={verifyCheckoutSessionAndUnlock}
      getSummary={getCheckoutScanSummary}
    />
  );
}
