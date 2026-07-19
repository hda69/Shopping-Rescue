import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';
import { MobileNav } from '@/components/mobile-nav';
import { SiteLogo } from '@/components/site-logo';

async function requireSession(locale: AppLocale) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect(localizePath('/login', locale));
  }
  return session;
}

export async function DashboardShell({
  locale,
  children,
}: {
  locale: AppLocale;
  children: React.ReactNode;
}) {
  const session = await requireSession(locale);
  const m = getMessages(locale);
  const links = [
    { href: localizePath('/dashboard', locale), label: m.dashboard.overview },
    { href: localizePath('/dashboard/sites', locale), label: m.dashboard.sites },
    { href: localizePath('/dashboard/integrations', locale), label: m.dashboard.integrations },
    { href: localizePath('/dashboard/billing', locale), label: m.dashboard.billing },
  ];
  const linkClass =
    'rounded-xl px-3 py-2 text-sm font-medium text-[#6e6e73] transition-colors hover:bg-black/5 hover:text-[#111]';

  return (
    <div className="min-h-screen section-muted">
      <header className="relative z-50 border-b border-white/60 bg-white/55 backdrop-blur-xl">
        <div className="section-container flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <SiteLogo href={localizePath('/', locale)} size="sm" />
            <p className="truncate text-sm text-[#6e6e73] sm:hidden">{session.email}</p>
          </div>

          <nav className="hidden items-center gap-2 sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <form action={`/api/auth/logout?locale=${locale}`} method="POST">
              <button type="submit" className={linkClass}>
                {m.dashboard.logout}
              </button>
            </form>
          </nav>

          <MobileNav openLabel={m.common.openMenu} closeLabel={m.common.closeMenu}>
            <p className="mb-2 truncate px-3 text-xs text-[#98989d]">{session.email}</p>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={`${linkClass} block w-full`}>
                {link.label}
              </Link>
            ))}
            <form action={`/api/auth/logout?locale=${locale}`} method="POST">
              <button type="submit" className={`${linkClass} block w-full text-left`}>
                {m.dashboard.logout}
              </button>
            </form>
          </MobileNav>
        </div>
      </header>
      <main className="section-container py-8 sm:py-10">{children}</main>
    </div>
  );
}
