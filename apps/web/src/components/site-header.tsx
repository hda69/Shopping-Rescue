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
          {session && (
            <form action={`/api/auth/logout?locale=${locale}`} method="POST">
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
                }`}
                aria-label={m.common.logout}
                title={m.common.logout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden lg:inline">{m.common.logout}</span>
              </button>
            </form>
          )}
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
