import { loadEnv } from '@shopping-rescue/shared/load-env';
import { startFullAuditCheckout } from '@/lib/checkout';
import { NextResponse } from 'next/server';
import { localizePath, parseLocaleParam } from '@/lib/locale';

loadEnv();

function redirectToScan(
  request: Request,
  scanId: string,
  locale: 'en' | 'fr',
  error?: string,
) {
  const url = new URL(localizePath(`/scan/${scanId}`, locale), request.url);
  if (error) {
    url.searchParams.set('checkoutError', error);
  }
  return NextResponse.redirect(url, 303);
}

async function handleCheckout(
  request: Request,
  scanId: string | null,
  locale: 'en' | 'fr',
) {
  if (!scanId) {
    return NextResponse.redirect(
      new URL(`${localizePath('/free-scan', locale)}?error=missing_scan`, request.url),
      303,
    );
  }

  try {
    const checkoutUrl = await startFullAuditCheckout(scanId, locale);
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scanId = url.searchParams.get('scanId');
  const locale = parseLocaleParam(url.searchParams.get('locale'));
  return handleCheckout(request, scanId, locale);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const scanId = formData.get('scanId');
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  return handleCheckout(request, typeof scanId === 'string' ? scanId : null, locale);
}
