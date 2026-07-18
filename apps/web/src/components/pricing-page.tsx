import Link from 'next/link';

import { getMessages } from '@/config/messages';
import { SiteHeader } from '@/components/site-header';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface PricingPageContentProps {
  locale: AppLocale;
  scanId?: string;
  stripeReady: boolean;
  monitoringReady: boolean;
  agencyReady: boolean;
}

export function PricingPageContent({
  locale,
  scanId,
  stripeReady,
  monitoringReady,
  agencyReady,
}: PricingPageContentProps) {
  const m = getMessages(locale);
  const freeScanHref = localizePath('/free-scan', locale);
  const checkoutHref = scanId
    ? `/api/checkout?scanId=${encodeURIComponent(scanId)}&locale=${locale}`
    : undefined;
  const monitoringHref = scanId
    ? `/api/checkout?scanId=${encodeURIComponent(scanId)}&locale=${locale}&plan=monitoring_pro`
    : undefined;
  const agencyHref = scanId
    ? `/api/checkout?scanId=${encodeURIComponent(scanId)}&locale=${locale}&plan=agency`
    : undefined;

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />

      <main className="section-container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.pricing.title}</h1>
          <p className="mt-4 text-[#6e6e73]">{m.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-[#111]">{m.pricing.freeScan}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">€0</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#6e6e73]">
              {m.pricing.freeFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
              {m.pricing.startFreeScan}
            </Link>
          </div>

          <div className="glass-card-highlight p-8">
            <h2 className="text-xl font-bold text-[#111]">{m.pricing.fullAudit}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">€79</p>
            <p className="text-sm text-[#6e6e73]">{m.pricing.oneTime}</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#6e6e73]">
              {m.pricing.fullFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {scanId && stripeReady && checkoutHref ? (
              <a href={checkoutHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
                {m.pricing.unlockScan}
              </a>
            ) : (
              <Link href={freeScanHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
                {m.pricing.runFreeScanFirst}
              </Link>
            )}

            {!stripeReady && (
              <p className="mt-4 text-xs text-amber-700">{m.pricing.stripeNotConfigured}</p>
            )}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-[#111]">{m.pricing.monitoringPro}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">€49</p>
            <p className="text-sm text-[#6e6e73]">{m.pricing.perMonth}</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#6e6e73]">
              {m.pricing.monitoringFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {scanId && monitoringReady && monitoringHref ? (
              <a href={monitoringHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
                {m.pricing.subscribeMonitoring}
              </a>
            ) : (
              <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
                {m.pricing.runFreeScanFirst}
              </Link>
            )}

            {stripeReady && !monitoringReady && (
              <p className="mt-4 text-xs text-amber-700">{m.pricing.monitoringStripeNotConfigured}</p>
            )}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-[#111]">{m.pricing.agency}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">€199</p>
            <p className="text-sm text-[#6e6e73]">{m.pricing.perMonth}</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#6e6e73]">
              {m.pricing.agencyFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {scanId && agencyReady && agencyHref ? (
              <a href={agencyHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
                {m.pricing.subscribeAgency}
              </a>
            ) : (
              <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
                {m.pricing.runFreeScanFirst}
              </Link>
            )}

            {stripeReady && !agencyReady && (
              <p className="mt-4 text-xs text-amber-700">{m.pricing.agencyStripeNotConfigured}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
