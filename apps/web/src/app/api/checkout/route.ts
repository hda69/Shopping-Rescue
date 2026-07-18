import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  startFullAuditCheckout,
  startMonitoringProCheckout,
  startAgencyCheckout,
} from '@/lib/checkout';
import { NextResponse } from 'next/server';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { appUrl } from '@/lib/app-url';

loadEnv();

function redirectToScan(
  request: Request,
  scanId: string,
  locale: 'en' | 'fr',
  error?: string,
) {
  const url = appUrl(localizePath(`/scan/${scanId}`, locale), request);
  if (error) {
    url.searchParams.set('checkoutError', error);
  }
  return NextResponse.redirect(url, 303);
}

type CheckoutPlan = 'full_audit' | 'monitoring_pro' | 'agency';

async function handleCheckout(
  request: Request,
  scanId: string | null,
  locale: 'en' | 'fr',
  plan: CheckoutPlan,
) {
  if (!scanId) {
    return NextResponse.redirect(
      appUrl(`${localizePath('/free-scan', locale)}?error=missing_scan`, request),
      303,
    );
  }

  try {
    const checkoutUrl =
      plan === 'agency'
        ? await startAgencyCheckout(scanId, locale)
        : plan === 'monitoring_pro'
          ? await startMonitoringProCheckout(scanId, locale)
          : await startFullAuditCheckout(scanId, locale);
    return NextResponse.redirect(checkoutUrl, 303);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_UNLOCKED') {
      return redirectToScan(request, scanId, locale);
    }

    const message =
      error instanceof Error
        ? error.message.includes('Invalid API Key')
          ? 'Stripe API key is invalid. Use sk_test_ keys from Stripe test mode.'
          : error.message
        : 'Checkout failed';

    return redirectToScan(request, scanId, locale, message);
  }
}

function parsePlan(value: string | null | undefined): CheckoutPlan {
  if (value === 'monitoring_pro') return 'monitoring_pro';
  if (value === 'agency') return 'agency';
  return 'full_audit';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scanId = url.searchParams.get('scanId');
  const locale = parseLocaleParam(url.searchParams.get('locale'));
  const plan = parsePlan(url.searchParams.get('plan'));
  return handleCheckout(request, scanId, locale, plan);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const scanId = formData.get('scanId');
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  const plan = parsePlan(formData.get('plan')?.toString());
  return handleCheckout(request, typeof scanId === 'string' ? scanId : null, locale, plan);
}
