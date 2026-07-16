import { loadEnv } from '@shopping-rescue/shared/load-env';
import { handleStripeWebhook, verifyStripeWebhook } from '@shopping-rescue/billing';
import { NextResponse } from 'next/server';

loadEnv();

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const payload = await request.text();
  const verification = verifyStripeWebhook(payload, signature);

  if (!verification.verified || !verification.event) {
    return NextResponse.json(
      { error: verification.error ?? 'Webhook verification failed' },
      { status: 400 },
    );
  }

  try {
    await handleStripeWebhook(verification.event);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('[stripe/webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
