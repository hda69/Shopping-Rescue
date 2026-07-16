import { PLAN_PRICES_CENTS } from '@shopping-rescue/shared';
import { localizePath, type AppLocale } from '@shopping-rescue/shared/i18n';
import type Stripe from 'stripe';
import { getAppUrl, getStripeClient, getStripePriceId } from './stripe-client';

export interface FullAuditCheckoutParams {
  scanId: string;
  organizationId: string;
  siteId?: string;
  customerEmail: string;
  locale?: AppLocale;
}
export async function createFullAuditCheckoutSession(
  params: FullAuditCheckoutParams,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const amountCents = PLAN_PRICES_CENTS.full_audit;
  const locale = params.locale ?? 'en';

  const session = await stripe.checkout.sessions.create({    mode: 'payment',
    customer_email: params.customerEmail,
    line_items: [
      {
        price: getStripePriceId('full_audit'),
        quantity: 1,
      },
    ],
    metadata: {
      scanId: params.scanId,
      organizationId: params.organizationId,
      siteId: params.siteId ?? '',
      plan: 'full_audit',
    },
    success_url: `${appUrl}${localizePath('/checkout/success', locale)}?scanId=${params.scanId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${localizePath(`/scan/${params.scanId}`, locale)}`,    payment_intent_data: {
      metadata: {
        scanId: params.scanId,
        organizationId: params.organizationId,
        plan: 'full_audit',
      },
    },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}
