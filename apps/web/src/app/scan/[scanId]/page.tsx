import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  isAgencyStripeConfigured,
  isMonitoringStripeConfigured,
  isStripeConfigured,
} from '@shopping-rescue/billing';
import { getScanResult } from '@/lib/scan-result';
import { ScanResultsPageContent } from '@/components/scan-results-page';
import { isDevUnlockEnabled } from '@/lib/checkout';

loadEnv();

export const dynamic = 'force-dynamic';

export default async function ScanResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ scanId: string }>;
  searchParams: Promise<{ checkoutError?: string }>;
}) {
  const { scanId } = await params;
  const query = await searchParams;
  const rawCheckoutError = query.checkoutError
    ? decodeURIComponent(query.checkoutError)
    : null;
  const checkoutError =
    rawCheckoutError && rawCheckoutError !== 'NEXT_REDIRECT' ? rawCheckoutError : null;
  const data = await getScanResult(scanId, 'en');

  return (
    <ScanResultsPageContent
      locale="en"
      data={data}
      checkoutError={checkoutError}
      stripeReady={isStripeConfigured()}
      monitoringReady={isMonitoringStripeConfigured()}
      agencyReady={isAgencyStripeConfigured()}
      devUnlockReady={isDevUnlockEnabled()}
    />
  );
}
