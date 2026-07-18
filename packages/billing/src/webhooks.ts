import type Stripe from 'stripe';
import {
  claimStripeWebhookEvent,
  completePurchaseForSession,
  markWebhookEventFailed,
  markWebhookEventProcessed,
  activateMonitoringSubscription,
  syncSubscriptionFromStripe,
} from '@shopping-rescue/database';
import { createLogger } from '@shopping-rescue/shared';
import { getStripeClient, getStripeWebhookSecret } from './stripe-client';

const logger = createLogger({ package: 'billing' });

export interface WebhookVerificationResult {
  verified: boolean;
  event?: Stripe.Event;
  error?: string;
}

export function verifyStripeWebhook(payload: string, signature: string): WebhookVerificationResult {
  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
    return { verified: true, event };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook verification failed';
    return { verified: false, error: message };
  }
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

async function handleFullAuditCheckout(session: Stripe.Checkout.Session) {
  const scanId = session.metadata?.scanId;
  if (!scanId) {
    throw new Error('Checkout session missing scanId metadata');
  }

  if (session.payment_status !== 'paid') {
    logger.warn('Checkout session completed but not paid', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await completePurchaseForSession(session.id, paymentIntentId);
  logger.info('Scan report unlocked after payment', { scanId, sessionId: session.id });
}

async function handleMonitoringCheckout(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  const siteId = session.metadata?.siteId;
  const scanId = session.metadata?.scanId;
  const email =
    session.metadata?.customerEmail ||
    session.customer_details?.email ||
    session.customer_email ||
    '';

  if (!organizationId || !siteId) {
    throw new Error('Monitoring checkout missing organizationId/siteId metadata');
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error('Monitoring checkout missing subscription id');
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!customerId) {
    throw new Error('Monitoring checkout missing customer id');
  }

  const stripe = getStripeClient();
  const subscription = (await stripe.subscriptions.retrieve(
    subscriptionId,
  )) as Stripe.Subscription;
  const period = getSubscriptionPeriod(subscription);

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

  logger.info('Monitoring subscription activated', {
    organizationId,
    siteId,
    scanId,
    subscriptionId: subscription.id,
    status: subscription.status,
    plan: session.metadata?.plan ?? 'monitoring_pro',
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const plan =
    session.metadata?.plan ??
    (session.mode === 'subscription' ? 'monitoring_pro' : 'full_audit');

  if (plan === 'monitoring_pro' || plan === 'agency' || session.mode === 'subscription') {
    await handleMonitoringCheckout(session);
    return;
  }

  await handleFullAuditCheckout(session);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const period = getSubscriptionPeriod(subscription);
  const updated = await syncSubscriptionFromStripe({
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  if (!updated) {
    logger.warn('Subscription update for unknown subscription', {
      subscriptionId: subscription.id,
    });
    return;
  }

  logger.info('Subscription synced from Stripe', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const claim = await claimStripeWebhookEvent(event.id, event.type, event);

  if (claim === 'already_processed') {
    logger.info('Stripe webhook already processed', { eventId: event.id });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      default:
        logger.info('Unhandled Stripe webhook event', { eventType: event.type });
    }

    await markWebhookEventProcessed(event.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    await markWebhookEventFailed(event.id, message);
    throw error;
  }
}
