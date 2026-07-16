import type Stripe from 'stripe';
import {
  claimStripeWebhookEvent,
  completePurchaseForSession,
  markWebhookEventFailed,
  markWebhookEventProcessed,
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
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
