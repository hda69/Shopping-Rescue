import Link from 'next/link';

import { getMessages } from '@/config/messages';
import { SiteHeader } from '@/components/site-header';
import { TestimonialsMarquee } from '@/components/testimonials-marquee';
import { getLegalPath } from '@/config/legal-content';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface PricingPageContentProps {
  locale: AppLocale;
  scanId?: string;
  stripeReady: boolean;
  monitoringReady: boolean;
  agencyReady: boolean;
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 text-left text-sm text-[#6e6e73]">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[#0a84ff]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
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

  const plans = [
    {
      key: 'free',
      name: m.pricing.freeScan,
      price: '€0',
      priceNote: null as string | null,
      bestFor: m.pricing.freeBestFor,
      description: m.pricing.freeDescription,
      features: m.pricing.freeFeatures,
      highlighted: false,
      cta: (
        <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
          {m.pricing.startFreeScan}
        </Link>
      ),
      warning: null as string | null,
    },
    {
      key: 'full',
      name: m.pricing.fullAudit,
      price: '€79',
      priceNote: m.pricing.oneTime,
      bestFor: m.pricing.fullBestFor,
      description: m.pricing.fullDescription,
      features: m.pricing.fullFeatures,
      highlighted: true,
      cta:
        scanId && stripeReady && checkoutHref ? (
          <a href={checkoutHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
            {m.pricing.unlockScan}
          </a>
        ) : (
          <Link href={freeScanHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
            {m.pricing.runFreeScanFirst}
          </Link>
        ),
      warning: !stripeReady ? m.pricing.stripeNotConfigured : null,
    },
    {
      key: 'monitoring',
      name: m.pricing.monitoringPro,
      price: '€49',
      priceNote: m.pricing.perMonth,
      bestFor: m.pricing.monitoringBestFor,
      description: m.pricing.monitoringDescription,
      features: m.pricing.monitoringFeatures,
      highlighted: false,
      cta:
        scanId && monitoringReady && monitoringHref ? (
          <a href={monitoringHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
            {m.pricing.subscribeMonitoring}
          </a>
        ) : (
          <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
            {m.pricing.runFreeScanFirst}
          </Link>
        ),
      warning: stripeReady && !monitoringReady ? m.pricing.monitoringStripeNotConfigured : null,
    },
    {
      key: 'agency',
      name: m.pricing.agency,
      price: '€199',
      priceNote: m.pricing.perMonth,
      bestFor: m.pricing.agencyBestFor,
      description: m.pricing.agencyDescription,
      features: m.pricing.agencyFeatures,
      highlighted: false,
      cta:
        scanId && agencyReady && agencyHref ? (
          <a href={agencyHref} className="btn-glass-accent mt-8 inline-block w-full text-center">
            {m.pricing.subscribeAgency}
          </a>
        ) : (
          <Link href={freeScanHref} className="btn-glass mt-8 inline-block w-full text-center">
            {m.pricing.runFreeScanFirst}
          </Link>
        ),
      warning: stripeReady && !agencyReady ? m.pricing.agencyStripeNotConfigured : null,
    },
  ];

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />

      <main className="section-container py-14 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111] sm:text-4xl">{m.pricing.title}</h1>
          <p className="mt-4 text-[#6e6e73]">{m.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={`flex flex-col ${plan.highlighted ? 'glass-card-highlight p-7' : 'glass-card p-7'}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0a84ff]">
                {plan.bestFor}
              </p>
              <h2 className="mt-3 text-xl font-bold text-[#111]">{plan.name}</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">{plan.price}</p>
              {plan.priceNote && <p className="text-sm text-[#6e6e73]">{plan.priceNote}</p>}
              <p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">{plan.description}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#98989d]">
                {m.pricing.includedLabel}
              </p>
              <FeatureList features={plan.features} />
              <div className="mt-auto">
                {plan.cta}
                {plan.warning && <p className="mt-3 text-xs text-amber-700">{plan.warning}</p>}
              </div>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-20 max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#111]">{m.pricing.compareTitle}</h2>
            <p className="mt-3 text-[#6e6e73]">{m.pricing.compareSub}</p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/60 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-[#98989d]">
                  <th className="px-4 py-3 font-semibold">{m.pricing.compareHeaders.feature}</th>
                  <th className="px-4 py-3 font-semibold">{m.pricing.compareHeaders.free}</th>
                  <th className="px-4 py-3 font-semibold text-[#0a84ff]">{m.pricing.compareHeaders.full}</th>
                  <th className="px-4 py-3 font-semibold">{m.pricing.compareHeaders.monitoring}</th>
                  <th className="px-4 py-3 font-semibold">{m.pricing.compareHeaders.agency}</th>
                </tr>
              </thead>
              <tbody>
                {m.pricing.compareRows.map((row) => (
                  <tr key={row.feature} className="border-b border-black/5 last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium text-[#111]">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3 text-[#6e6e73]">{row.free}</td>
                    <td className="px-4 py-3 font-medium text-[#111]">{row.full}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{row.monitoring}</td>
                    <td className="px-4 py-3 text-[#6e6e73]">{row.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#111]">
            {m.pricing.chooseTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {m.pricing.chooseItems.map((item) => (
              <div key={item.title} className="glass-card p-6">
                <h3 className="text-base font-semibold text-[#111]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <TestimonialsMarquee
        title={m.home.reviewsTitle}
        subtitle={m.home.reviewsSub}
        items={m.home.reviews}
      />

      <footer className="border-t border-black/5 bg-white/40 py-8 backdrop-blur-md">
        <div className="section-container flex flex-col items-center justify-between gap-4 text-sm text-[#6e6e73] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Shopping Rescue. {m.common.rightsReserved}
          </p>
          <div className="flex gap-6">
            <Link href={getLegalPath('terms', locale)} className="transition-colors hover:text-[#111]">
              {m.common.terms}
            </Link>
            <Link href={getLegalPath('privacy', locale)} className="transition-colors hover:text-[#111]">
              {m.common.privacy}
            </Link>
            <Link href={getLegalPath('disclaimer', locale)} className="transition-colors hover:text-[#111]">
              {m.common.disclaimer}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
