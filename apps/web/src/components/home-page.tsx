import Link from 'next/link';

import { getMessages } from '@/config/messages';
import { SiteHeader } from '@/components/site-header';
import { SiteLogo } from '@/components/site-logo';
import { TestimonialsMarquee } from '@/components/testimonials-marquee';
import { getLegalPath } from '@/config/legal-content';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface HomePageContentProps {
  locale: AppLocale;
}

export function HomePageContent({ locale }: HomePageContentProps) {
  const m = getMessages(locale);
  const freeScanHref = localizePath('/free-scan', locale);
  const pricingHref = localizePath('/pricing', locale);

  return (
    <div className="min-h-screen">
      <section className="hero-cover min-h-[92vh]">
        <div className="hero-glow hero-glow--blue" />
        <div className="hero-glow hero-glow--purple" />
        <div className="hero-glow hero-glow--red" />

        <SiteHeader variant="dark" locale={locale} />

        <div className="section-container flex flex-col justify-center pb-20 pt-12 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <SiteLogo
              href={localizePath('/', locale)}
              size="hero"
              priority
              showWordmark={false}
              className="mx-auto"
            />
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              {m.home.eyebrow}
            </p>
            <h1 className="text-[1.75rem] font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              {m.home.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
              {m.home.subheadline}
            </p>
            <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href={freeScanHref} className="btn-glass-primary w-full text-center sm:w-auto sm:min-w-[180px]">
                {m.common.startFreeScan}
              </Link>
              <a
                href={locale === 'fr' ? '/fr#how-it-works' : '/#how-it-works'}
                className="btn-glass-ghost w-full text-center sm:w-auto sm:min-w-[180px]"
              >
                {m.home.seeHowItWorks}
              </a>
            </div>
            <p className="mt-8 text-sm text-white/45">{m.home.heroNote}</p>
          </div>

          <div className="mx-auto mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {m.home.stats.map((stat) => (
              <div key={stat.label} className="glass-card-dark text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-white/50">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        <section id="how-it-works" className="section-muted py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#111]">{m.home.howItWorksTitle}</h2>
              <p className="mt-4 text-[#6e6e73]">{m.home.howItWorksSub}</p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {m.home.steps.map((item) => (
                <div key={item.step} className="glass-card">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111] text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#111]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TestimonialsMarquee
          title={m.home.reviewsTitle}
          subtitle={m.home.reviewsSub}
          items={m.home.reviews}
        />

        <section id="pricing" className="py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#111]">{m.home.pricingTitle}</h2>
              <p className="mt-4 text-[#6e6e73]">{m.home.pricingSub}</p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {m.home.plans.map((plan) => (
                <div
                  key={plan.name}
                  className={plan.highlighted ? 'glass-card-highlight p-8' : 'glass-card p-8'}
                >
                  {'badge' in plan && plan.badge && (
                    <span className="mb-4 inline-block rounded-full bg-[#0a84ff]/15 px-3 py-1 text-xs font-semibold text-[#0a84ff]">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-[#111]">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#111]">{plan.price}</p>
                  <p className="mt-2 text-sm text-[#6e6e73]">{plan.description}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#6e6e73]">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#0a84ff]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href={pricingHref} className="btn-glass px-5 py-2.5 text-sm">
                {m.home.viewFullPricing}
              </Link>
            </div>
          </div>
        </section>

        <section className="section-muted py-12">
          <div className="section-container">
            <div className="alert-banner mx-auto max-w-3xl">
              <p className="font-semibold">{m.common.disclaimerTitle}</p>
              <p className="mt-1 text-[#6e6e73]">{m.common.disclaimerBody}</p>
            </div>
          </div>
        </section>

        <section className="hero-cover py-24">
          <div className="hero-glow hero-glow--blue !bottom-auto !top-0 !opacity-30" />
          <div className="hero-glow hero-glow--purple !right-auto !left-1/4 !opacity-25" />
          <div className="section-container text-center">
            <h2 className="text-3xl font-bold tracking-tight">{m.home.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">{m.home.ctaSub}</p>
            <div className="mt-8">
              <Link href={freeScanHref} className="btn-glass-primary">
                {m.home.startYourFreeScan}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white/40 py-8 backdrop-blur-md">
        <div className="section-container flex flex-col gap-6 text-sm text-[#6e6e73]">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span className="w-full text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#98989d] sm:w-auto sm:text-left">
              {m.common.commonIssues}
            </span>
            <Link href={localizePath('/merchant-center-suspended', locale)} className="transition-colors hover:text-[#111]">
              {m.common.seoLinks.suspended}
            </Link>
            <Link href={localizePath('/merchant-center-misrepresentation', locale)} className="transition-colors hover:text-[#111]">
              {m.common.seoLinks.misrepresentation}
            </Link>
            <Link href={localizePath('/website-needs-improvement', locale)} className="transition-colors hover:text-[#111]">
              {m.common.seoLinks.websiteQuality}
            </Link>
            <Link href={localizePath('/product-disapprovals', locale)} className="transition-colors hover:text-[#111]">
              {m.common.seoLinks.productDisapprovals}
            </Link>
            <Link href={localizePath('/shopify-merchant-center', locale)} className="transition-colors hover:text-[#111]">
              {m.common.seoLinks.shopify}
            </Link>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
        </div>
      </footer>
    </div>
  );
}
