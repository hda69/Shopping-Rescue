import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isStripeConfigured } from '@shopping-rescue/billing';
import { PLAN_PRICES_CENTS } from '@shopping-rescue/shared';
import { getMessages } from '@/config/messages';
import { SiteLogo } from '@/components/site-logo';
import { GoogleAdsPurchaseConversion } from '@/components/google-ads-purchase';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface CheckoutSuccessPageContentProps {
  locale: AppLocale;
  scanId?: string;
  sessionId?: string;
  plan?: string;
  verifyCheckout: (sessionId: string, scanId: string) => Promise<boolean>;
  getSummary: (scanId: string) => Promise<{ isReportUnlocked: boolean } | null>;
}

function planValueUsd(plan: string | undefined): number {
  const cents =
    PLAN_PRICES_CENTS[plan ?? 'full_audit'] ?? PLAN_PRICES_CENTS.full_audit ?? 7900;
  return cents / 100;
}

export async function CheckoutSuccessPageContent({
  locale,
  scanId,
  sessionId,
  plan,
  verifyCheckout,
  getSummary,
}: CheckoutSuccessPageContentProps) {
  const m = getMessages(locale);
  const homeHref = localizePath('/', locale);
  const freeScanHref = localizePath('/free-scan', locale);

  if (!scanId) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-red-600">{m.checkout.missingScan}</p>
        <Link href={freeScanHref} className="btn-primary mt-4 inline-block">
          {m.common.startFreeScan}
        </Link>
      </div>
    );
  }

  const scanHref = localizePath(`/scan/${scanId}`, locale);

  if (sessionId) {
    await verifyCheckout(sessionId, scanId);
    const summary = await getSummary(scanId);

    return (
      <div className="min-h-screen bg-gray-50">
        <GoogleAdsPurchaseConversion
          transactionId={sessionId}
          value={planValueUsd(plan)}
          currency="USD"
          redirectTo={scanHref}
        />

        <header className="border-b border-gray-200 bg-white">
          <div className="section-container flex h-16 items-center justify-between">
            <SiteLogo href={homeHref} size="sm" />
          </div>
        </header>

        <main className="section-container py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
          <h1 className="mt-6 text-2xl font-bold text-navy">{m.checkout.paymentReceived}</h1>
          <p className="mt-3 text-gray-600">
            {summary?.isReportUnlocked ? m.checkout.unlocking : m.checkout.unlocking}
          </p>
          {!isStripeConfigured() && (
            <p className="mt-4 text-sm text-amber-700">{m.checkout.stripeLocal}</p>
          )}
          <Link href={scanHref} className="btn-primary mt-8 inline-block">
            {m.checkout.viewResults}
          </Link>
        </main>
      </div>
    );
  }

  const summary = await getSummary(scanId);

  if (summary?.isReportUnlocked) {
    redirect(scanHref);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <meta httpEquiv="refresh" content="3" />

      <header className="border-b border-gray-200 bg-white">
        <div className="section-container flex h-16 items-center justify-between">
          <SiteLogo href={homeHref} size="sm" />
        </div>
      </header>

      <main className="section-container py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
        <h1 className="mt-6 text-2xl font-bold text-navy">{m.checkout.paymentReceived}</h1>
        <p className="mt-3 text-gray-600">{m.checkout.unlocking}</p>
        {!isStripeConfigured() && (
          <p className="mt-4 text-sm text-amber-700">{m.checkout.stripeLocal}</p>
        )}
        <Link href={scanHref} className="btn-primary mt-8 inline-block">
          {m.checkout.viewResults}
        </Link>
      </main>
    </div>
  );
}
