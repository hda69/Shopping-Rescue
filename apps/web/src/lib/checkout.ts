import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  createFullAuditCheckoutSession,
  isStripeConfigured,
  retrieveCheckoutSession,
} from '@shopping-rescue/billing';
import {
  completePurchaseForSession,
  createPendingPurchase,
  getScanForCheckout,
  getScanWithSite,
  unlockScanReport,
} from '@shopping-rescue/database';
import { PLAN_PRICES_CENTS } from '@shopping-rescue/shared';

loadEnv();

export async function startFullAuditCheckout(
  scanId: string,
  locale: 'en' | 'fr' = 'en',
): Promise<string> {
  if (!isStripeConfigured()) {
    throw new Error(
      'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_FULL_AUDIT to your .env file.',
    );
  }

  const row = await getScanWithSite(scanId);
  if (!row) {
    throw new Error('Scan not found');
  }

  const { scan, site } = row;

  if (scan.status !== 'completed') {
    throw new Error('Scan is not complete yet');
  }

  if (scan.isReportUnlocked) {
    throw new Error('ALREADY_UNLOCKED');
  }

  if (!scan.organizationId) {
    throw new Error('Scan has no organization');
  }

  if (!scan.visitorEmail) {
    throw new Error('Scan is missing visitor email');
  }

  const { url, sessionId } = await createFullAuditCheckoutSession({
    scanId,
    organizationId: scan.organizationId,
    siteId: site.id,
    customerEmail: scan.visitorEmail,
    locale,
  });

  await createPendingPurchase({
    organizationId: scan.organizationId,
    siteId: site.id,
    scanId,
    stripeCheckoutSessionId: sessionId,
    plan: 'full_audit',
    amountCents: PLAN_PRICES_CENTS.full_audit ?? 7900,
  });

  return url;
}

export async function verifyCheckoutSessionAndUnlock(
  sessionId: string,
  scanId: string,
): Promise<boolean> {
  if (!isStripeConfigured()) {
    return false;
  }

  const session = await retrieveCheckoutSession(sessionId);
  if (session.metadata?.scanId !== scanId) {
    return false;
  }

  if (session.payment_status !== 'paid') {
    return false;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await completePurchaseForSession(session.id, paymentIntentId);
  return true;
}

export async function getCheckoutScanSummary(scanId: string) {
  const scan = await getScanForCheckout(scanId);
  if (!scan) return null;
  return {
    scanId: scan.id,
    isReportUnlocked: scan.isReportUnlocked,
    status: scan.status,
  };
}

export function isDevUnlockEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.BILLING_DEV_UNLOCK === 'true';
}

export async function devUnlockScan(scanId: string) {
  if (!isDevUnlockEnabled()) {
    throw new Error('Dev unlock is disabled');
  }

  const scan = await getScanForCheckout(scanId);
  if (!scan) {
    throw new Error('Scan not found');
  }

  if (scan.status !== 'completed') {
    throw new Error('Scan is not complete yet');
  }

  await unlockScanReport(scanId);
}
