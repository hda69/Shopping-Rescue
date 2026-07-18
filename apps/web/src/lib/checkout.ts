import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  createFullAuditCheckoutSession,
  createMonitoringProCheckoutSession,
  createAgencyCheckoutSession,
  isMonitoringStripeConfigured,
  isAgencyStripeConfigured,
  isStripeConfigured,
  retrieveCheckoutSession,
  getStripeClient,
} from '@shopping-rescue/billing';
import {
  activateMonitoringSubscription,
  completePurchaseForSession,
  createPendingPurchase,
  getScanForCheckout,
  getScanWithSite,
  prepareMonitoringCheckoutFromScan,
  unlockScanReport,
} from '@shopping-rescue/database';
import { PLAN_PRICES_CENTS } from '@shopping-rescue/shared';
import type { Stripe } from '@shopping-rescue/billing';

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

export async function startMonitoringProCheckout(
  scanId: string,
  locale: 'en' | 'fr' = 'en',
): Promise<string> {
  if (!isMonitoringStripeConfigured()) {
    throw new Error(
      'Monitoring Pro Stripe price is not configured. Add STRIPE_PRICE_MONITORING_PRO to your .env file.',
    );
  }

  const prepared = await prepareMonitoringCheckoutFromScan(scanId);
  const { url } = await createMonitoringProCheckoutSession({
    scanId,
    organizationId: prepared.organizationId,
    siteId: prepared.siteId,
    customerEmail: prepared.email,
    locale: locale || prepared.locale,
  });

  return url;
}

export async function startAgencyCheckout(
  scanId: string,
  locale: 'en' | 'fr' = 'en',
): Promise<string> {
  if (!isAgencyStripeConfigured()) {
    throw new Error(
      'Agency Stripe price is not configured. Add STRIPE_PRICE_AGENCY to your .env file.',
    );
  }

  const prepared = await prepareMonitoringCheckoutFromScan(scanId);
  const { url } = await createAgencyCheckoutSession({
    scanId,
    organizationId: prepared.organizationId,
    siteId: prepared.siteId,
    customerEmail: prepared.email,
    locale: locale || prepared.locale,
  });

  return url;
}

function toDate(unixSeconds: number | null | undefined): Date | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000);
}

function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  start: Date | null;
  end: Date | null;
} {
  const raw = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  return {
    start: toDate(raw.current_period_start ?? subscription.billing_cycle_anchor),
    end: toDate(raw.current_period_end ?? subscription.cancel_at),
  };
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

  const plan = session.metadata?.plan;

  if (plan === 'monitoring_pro' || plan === 'agency' || session.mode === 'subscription') {
    return verifyMonitoringCheckoutSession(session, scanId);
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

async function verifyMonitoringCheckoutSession(
  session: Stripe.Checkout.Session,
  scanId: string,
): Promise<boolean> {
  const organizationId = session.metadata?.organizationId;
  const siteId = session.metadata?.siteId;
  if (!organizationId || !siteId) return false;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!subscriptionId || !customerId) return false;

  const stripe = getStripeClient();
  const subscription = (await stripe.subscriptions.retrieve(
    subscriptionId,
  )) as Stripe.Subscription;
  const period = getSubscriptionPeriod(subscription);

  const email =
    session.metadata?.customerEmail ||
    session.customer_details?.email ||
    session.customer_email ||
    '';

  await activateMonitoringSubscription({
    organizationId,
    siteId,
    scanId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    email,
    status: subscription.status,
    plan: session.metadata?.plan === 'agency' ? 'agency' : 'monitoring_pro',
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  return ['active', 'trialing'].includes(subscription.status);
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
