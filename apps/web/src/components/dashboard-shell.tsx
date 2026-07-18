import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';
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

  return (
    <div className="min-h-screen section-muted">
      <header className="border-b border-white/60 bg-white/55 backdrop-blur-xl">
        <div className="section-container flex h-16 items-center justify-between gap-4">
          <SiteLogo href={localizePath('/dashboard', locale)} size="sm" />
          <nav className="hidden items-center gap-2 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[#6e6e73] hover:bg-black/5 hover:text-[#111]"
              >
                {link.label}
              </Link>
            ))}
            <form action={`/api/auth/logout?locale=${locale}`} method="POST">
              <button type="submit" className="rounded-xl px-3 py-2 text-sm font-medium text-[#6e6e73] hover:bg-black/5">
                {m.dashboard.logout}
              </button>
            </form>
          </nav>
        </div>
        <div className="section-container pb-3 text-sm text-[#6e6e73] sm:hidden">
          {session.email}
        </div>
      </header>
      <main className="section-container py-10">{children}</main>
    </div>
  );
}
