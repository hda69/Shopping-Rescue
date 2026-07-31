import Stripe from 'stripe';
import { isStripeConfigured } from './config';

let stripeClient: Stripe | null = null;

export { isStripeConfigured };

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return secret;
}

export function getStripePriceId(plan: 'full_audit' | 'monitoring_pro' | 'agency'): string {
  const envMap = {
    full_audit: 'STRIPE_PRICE_FULL_AUDIT',
    monitoring_pro: 'STRIPE_PRICE_MONITORING_PRO',
    agency: 'STRIPE_PRICE_AGENCY',
  } as const;

  const value = process.env[envMap[plan]]?.trim();
  if (!value) {
    throw new Error(`${envMap[plan]} is not configured`);
  }
  return value;
}

export function getAppUrl(): string {
  const candidates = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL];
  for (const raw of candidates) {
    const value = raw?.trim().replace(/\/$/, '');
    if (value && !/localhost|0\.0\.0\.0|127\.0\.0\.1/.test(value)) {
      return value;
    }
    if (value && process.env.NODE_ENV !== 'production') {
      return value;
    }
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://shoppingrescue.app';
  }
  return 'http://localhost:3000';
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }
  return stripeClient;
}

export type { Stripe };
