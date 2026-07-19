import { getSessionFromCookies } from '@shopping-rescue/auth';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';
import { FreeScanNavLink } from '@/components/free-scan-nav-link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SiteLogo } from '@/components/site-logo';

interface SiteHeaderProps {
  variant?: 'dark' | 'light';
  locale?: AppLocale;
  sticky?: boolean;
}

export async function SiteHeader({
  variant = 'light',
  locale = 'en',
  sticky = true,
}: SiteHeaderProps) {
  const isDark = variant === 'dark';
  const m = getMessages(locale);
  const session = await getSessionFromCookies();
  const homeHref = localizePath('/', locale);
  const howItWorksAnchor = locale === 'fr' ? '/fr#how-it-works' : '/#how-it-works';
  const pricingAnchor = locale === 'fr' ? '/fr#pricing' : '/#pricing';
  const accountHref = session
    ? localizePath('/dashboard', locale)
    : localizePath('/login', locale);
  const accountLabel = session ? m.common.dashboard : m.common.login;

  return (
    <header
      className={`${sticky ? 'sticky top-0 z-50' : 'relative z-10'} border-b ${
        isDark
          ? 'border-white/10 bg-[#0b0d14]/70 backdrop-blur-xl'
          : 'border-white/60 bg-white/55 backdrop-blur-xl'
      }`}
    >
      <div className="section-container flex h-16 items-center justify-between gap-3">
        <SiteLogo
          href={homeHref}
          size="sm"
          priority={isDark}
          wordmarkClassName={
            isDark
              ? 'hidden sm:inline text-base [&>span:first-child]:text-white'
              : 'hidden sm:inline text-base'
          }
        />
        <nav className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher
            locale={locale}
            label={m.common.languageLabel}
            englishLabel={m.common.english}
            frenchLabel={m.common.french}
            variant={variant}
          />
          <a
            href={accountHref}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              isDark
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
            }`}
          >
            {accountLabel}
          </a>
          <a
            href={howItWorksAnchor}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              isDark
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
            }`}
          >
            {m.common.howItWorks}
          </a>
          <a
            href={pricingAnchor}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              isDark
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
            }`}
          >
            {m.common.pricing}
          </a>
          <FreeScanNavLink
            locale={locale}
            label={m.common.startFreeScan}
            className={
              isDark ? 'btn-glass-primary px-4 py-2 text-sm' : 'btn-glass-accent px-4 py-2 text-sm'
            }
          />
        </nav>
      </div>
    </header>
  );
}
