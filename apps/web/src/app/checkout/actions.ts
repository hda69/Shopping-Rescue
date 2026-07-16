'use server';

import { redirect } from 'next/navigation';
import { devUnlockScan, startFullAuditCheckout } from '@/lib/checkout';
import { localizePath, parseLocaleParam, type AppLocale } from '@shopping-rescue/shared/i18n';

function getCheckoutErrorMessage(error: unknown, locale: AppLocale): string {
  if (error instanceof Error) {
    if (error.message.includes('Invalid API Key')) {
      return locale === 'fr'
        ? 'Clé API Stripe invalide. Utilisez des clés sk_test_ du mode test Stripe, pas sk_live_.'
        : 'Stripe API key is invalid. Use sk_test_ keys from Stripe test mode, not sk_live_.';
    }
    if (error.message === 'ALREADY_UNLOCKED') {
      return locale === 'fr'
        ? 'Ce rapport est déjà débloqué.'
        : 'This report is already unlocked.';
    }
    return error.message;
  }
  return locale === 'fr'
    ? 'Échec du paiement. Veuillez réessayer.'
    : 'Checkout failed. Please try again.';
}

export async function checkoutFullAudit(formData: FormData) {
  const scanId = formData.get('scanId');
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  if (typeof scanId !== 'string' || !scanId) {
    redirect(`${localizePath('/free-scan', locale)}?error=missing_scan`);
  }

  let checkoutUrl: string;

  try {
    checkoutUrl = await startFullAuditCheckout(scanId, locale);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_UNLOCKED') {
      redirect(localizePath(`/scan/${scanId}`, locale));
    }

    const message = getCheckoutErrorMessage(error, locale);
    redirect(
      `${localizePath(`/scan/${scanId}`, locale)}?checkoutError=${encodeURIComponent(message)}`,
    );
  }

  redirect(checkoutUrl);
}

export async function devUnlockFullAudit(formData: FormData) {
  const scanId = formData.get('scanId');
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  if (typeof scanId !== 'string' || !scanId) {
    redirect(`${localizePath('/free-scan', locale)}?error=missing_scan`);
  }

  try {
    await devUnlockScan(scanId);
  } catch (error) {
    const message = error instanceof Error ? error.message : locale === 'fr' ? 'Échec du déblocage dev' : 'Dev unlock failed';
    redirect(
      `${localizePath(`/scan/${scanId}`, locale)}?checkoutError=${encodeURIComponent(message)}`,
    );
  }

  redirect(localizePath(`/scan/${scanId}`, locale));
}
