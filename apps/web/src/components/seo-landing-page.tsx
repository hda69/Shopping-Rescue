import Link from 'next/link';

import { JsonLd } from '@/components/json-ld';
import { SiteHeader } from '@/components/site-header';
import { SiteLogo } from '@/components/site-logo';
import { getLegalPath } from '@/config/legal-content';
import {
  buildFreeScanHref,
  buildSeoPagePath,
  getSeoLandingPage,
  type SeoLandingPageConfig,
  type SeoLandingSlug,
  type AppLocale,
} from '@/config/seo-landing-pages';
import { SEO_LANDING_UI } from '@/config/seo-landing-ui';
import { localizePath } from '@/lib/locale';

interface SeoLandingPageProps {
  page: SeoLandingPageConfig;
  locale?: AppLocale;
}

export function SeoLandingPage({ page, locale = 'en' }: SeoLandingPageProps) {
  const ui = SEO_LANDING_UI[locale];
  const freeScanHref = buildFreeScanHref(page, locale);
  const pricingHref = localizePath('/pricing', locale);
  const homeHref = localizePath('/', locale);
  const relatedPages = page.relatedSlugs
    .map((slug) => getSeoLandingPage(slug, locale))
    .filter((entry): entry is SeoLandingPageConfig => Boolean(entry));

  const englishHref = buildSeoPagePath(page.slug as SeoLandingSlug, 'en');
  const frenchHref = buildSeoPagePath(page.slug as SeoLandingSlug, 'fr');

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: page.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }}
      />
      <section className="hero-cover pb-16 pt-0">
        <div className="hero-glow hero-glow--blue" />
        <div className="hero-glow hero-glow--purple" />
        <div className="hero-glow hero-glow--red" />

        <SiteHeader
          variant="dark"
          locale={locale}
        />

        <div className="section-container pb-4 pt-10 sm:pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <SiteLogo href={homeHref} size="md" showWordmark={false} className="mx-auto" />
            <nav
              aria-label={ui.languageLabel}
              className="mt-6 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-1 py-1 text-xs font-medium"
            >
              <Link
                href={englishHref}
                className={
                  locale === 'en'
                    ? 'rounded-full bg-white/90 px-3 py-1.5 text-[#111]'
                    : 'rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white'
                }
              >
                {ui.switchToEnglish}
              </Link>
              <Link
                href={frenchHref}
                className={
                  locale === 'fr'
                    ? 'rounded-full bg-white/90 px-3 py-1.5 text-[#111]'
                    : 'rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white'
                }
              >
                {ui.switchToFrench}
              </Link>
            </nav>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              {page.eyebrow}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {page.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
              {page.subheadline}
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href={freeScanHref} className="btn-glass-primary w-full text-center sm:w-auto sm:min-w-[200px]">
                {ui.startFreeScan}
              </Link>
              <Link href={pricingHref} className="btn-glass-ghost w-full text-center sm:w-auto sm:min-w-[200px]">
                {ui.viewPricing}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="section-muted py-16 sm:py-20">
          <div className="section-container">
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
              <article className="glass-card p-8">
                <h2 className="text-xl font-bold text-[#111]">{ui.whyMerchantsLandHere}</h2>
                <p className="mt-4 text-sm leading-relaxed text-[#6e6e73]">{page.intro}</p>
              </article>
              <article className="glass-card p-8">
                <h2 className="text-xl font-bold text-[#111]">{ui.whatIssueMeans}</h2>
                <p className="mt-4 text-sm leading-relaxed text-[#6e6e73]">{page.whatItMeans}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#111]">{ui.commonCauses}</h2>
              <p className="mt-3 text-[#6e6e73]">{ui.commonCausesSub}</p>
            </div>
            <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {page.commonCauses.map((cause) => (
                <li key={cause} className="glass-card flex gap-3 p-5 text-sm leading-relaxed text-[#444]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0a84ff]/10 text-xs font-bold text-[#0a84ff]">
                    •
                  </span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-muted py-16 sm:py-20">
          <div className="section-container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#111]">{ui.whatWeCheck}</h2>
              <p className="mt-3 text-[#6e6e73]">{ui.whatWeCheckSub}</p>
            </div>
            <ul className="mx-auto mt-10 max-w-2xl space-y-3">
              {page.checks.map((check) => (
                <li key={check} className="flex items-start gap-3 text-sm text-[#444]">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0a84ff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-2xl font-bold tracking-tight text-[#111]">{ui.faq}</h2>
              <dl className="mt-10 space-y-4">
                {page.faq.map((item) => (
                  <div key={item.question} className="glass-card p-6">
                    <dt className="font-semibold text-[#111]">{item.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {relatedPages.length > 0 && (
          <section className="section-muted py-12">
            <div className="section-container">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-lg font-bold text-[#111]">{ui.relatedIssues}</h2>
                <nav className="mt-4 flex flex-wrap justify-center gap-3">
                  {relatedPages.map((related) => (
                    <Link
                      key={related.slug}
                      href={buildSeoPagePath(related.slug as SeoLandingSlug, locale)}
                      className="rounded-full border border-black/5 bg-white/60 px-4 py-2 text-sm font-medium text-[#444] transition-colors hover:border-[#0a84ff]/30 hover:text-[#111]"
                    >
                      {related.eyebrow}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </section>
        )}

        <section className="section-muted py-10">
          <div className="section-container">
            <div className="alert-banner mx-auto max-w-3xl">
              <p className="font-semibold">{ui.disclaimerTitle}</p>
              <p className="mt-1 text-[#6e6e73]">{ui.disclaimerBody}</p>
            </div>
          </div>
        </section>

        <section className="hero-cover py-20">
          <div className="hero-glow hero-glow--blue !bottom-auto !top-0 !opacity-30" />
          <div className="section-container text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{ui.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">{ui.ctaSub}</p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href={freeScanHref} className="btn-glass-primary w-full text-center sm:w-auto sm:min-w-[200px]">
                {ui.startFreeScan}
              </Link>
              <Link href={pricingHref} className="btn-glass-ghost w-full text-center sm:w-auto sm:min-w-[200px]">
                {ui.fullAuditCta}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white/40 py-8 backdrop-blur-md">
        <div className="section-container flex flex-col items-center justify-between gap-4 text-sm text-[#6e6e73] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Shopping Rescue. {ui.rightsReserved}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href={getLegalPath('terms', locale)} className="transition-colors hover:text-[#111]">
              {ui.terms}
            </Link>
            <Link href={getLegalPath('privacy', locale)} className="transition-colors hover:text-[#111]">
              {ui.privacy}
            </Link>
            <Link href={getLegalPath('disclaimer', locale)} className="transition-colors hover:text-[#111]">
              {ui.disclaimer}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
