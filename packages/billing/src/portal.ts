import { getAppUrl, getStripeClient } from './stripe-client';
import { localizePath, type AppLocale } from '@shopping-rescue/shared/i18n';

export async function createBillingPortalSession(input: {
  stripeCustomerId: string;
  locale?: AppLocale;
}): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const locale = input.locale ?? 'en';

  const session = await stripe.billingPortal.sessions.create({
    customer: input.stripeCustomerId,
    return_url: `${appUrl}${localizePath('/dashboard/billing', locale)}`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a billing portal URL');
  }

  return { url: session.url };
}
