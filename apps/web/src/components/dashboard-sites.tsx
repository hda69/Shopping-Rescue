import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import {
  addSiteForOrganization,
  getPrimaryOrganizationForUser,
  listSitesForUser,
  getLatestScanForSite,
} from '@shopping-rescue/database';
import { DashboardShell } from '@/components/dashboard-shell';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';

async function addSiteAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const url = formData.get('url')?.toString() ?? '';
  const session = await getSessionFromCookies();
  if (!session) redirect(localizePath('/login', locale));

  const org = await getPrimaryOrganizationForUser(session.userId);
  if (!org) {
    redirect(`${localizePath('/dashboard/sites', locale)}?error=no_org`);
  }

  const result = await addSiteForOrganization({
    userId: session.userId,
    organizationId: org.id,
    url,
  });

  if ('error' in result) {
    redirect(`${localizePath('/dashboard/sites', locale)}?error=${result.error}`);
  }

  redirect(localizePath(`/dashboard/sites/${result.siteId}`, locale));
}

export async function DashboardSitesPage({
  locale,
  error,
}: {
  locale: AppLocale;
  error?: string;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect(localizePath('/login', locale));

  const m = getMessages(locale);
  const org = await getPrimaryOrganizationForUser(session.userId);
  const sites = await listSitesForUser(session.userId);
  const withLatest = await Promise.all(
    sites.map(async (site) => ({ site, latest: await getLatestScanForSite(site.id) })),
  );

  return (
    <DashboardShell locale={locale}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.dashboard.sites}</h1>

        {org && (
          <form action={addSiteAction} className="glass-card mt-8 space-y-3 p-6">
            <input type="hidden" name="locale" value={locale} />
            <h2 className="text-lg font-semibold text-[#111]">{m.dashboard.addSite}</h2>
            <label className="block text-sm text-[#6e6e73]">
              {m.dashboard.addSiteUrl}
              <input name="url" required type="url" className="glass-input mt-2 w-full" placeholder="https://" />
            </label>
            <button type="submit" className="btn-glass-accent">
              {m.dashboard.addSiteSubmit}
            </button>
            {error === 'site_limit_reached' && (
              <p className="text-sm text-amber-700">{m.dashboard.siteLimit}</p>
            )}
          </form>
        )}

        {!org && <p className="mt-8 text-sm text-[#6e6e73]">{m.dashboard.noOrg}</p>}

        <ul className="mt-8 space-y-3">
          {withLatest.map(({ site, latest }) => (
            <li key={site.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <Link
                  href={localizePath(`/dashboard/sites/${site.id}`, locale)}
                  className="font-medium text-[#111] hover:underline"
                >
                  {site.normalizedUrl}
                </Link>
                <p className="text-sm text-[#6e6e73]">
                  {latest
                    ? `${m.dashboard.latestScan}: ${latest.status}${latest.riskScore != null ? ` · ${latest.riskScore}/100` : ''}`
                    : m.dashboard.noScans}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}
