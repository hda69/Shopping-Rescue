import Link from 'next/link';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import {
  getPrimaryOrganizationForUser,
  listSitesForUser,
  getLatestScanForSite,
  countSitesForOrganization,
} from '@shopping-rescue/database';
import { getPlanLimits, type PlanType } from '@shopping-rescue/shared';
import { DashboardShell } from '@/components/dashboard-shell';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';

function asPlan(plan: string): PlanType {
  if (plan === 'agency' || plan === 'monitoring_pro' || plan === 'full_audit') return plan;
  return 'free';
}

export async function DashboardOverview({ locale }: { locale: AppLocale }) {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const m = getMessages(locale);
  const org = await getPrimaryOrganizationForUser(session.userId);
  const sites = await listSitesForUser(session.userId);
  const limits = org ? getPlanLimits(asPlan(org.plan)) : null;
  const siteCount = org ? await countSitesForOrganization(org.id) : 0;

  const siteSummaries = await Promise.all(
    sites.slice(0, 5).map(async (site) => ({
      site,
      latest: await getLatestScanForSite(site.id),
    })),
  );

  return (
    <DashboardShell locale={locale}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.dashboard.title}</h1>
        <p className="mt-2 text-[#6e6e73]">{session.email}</p>

        {!org ? (
          <p className="glass-card mt-8 p-6 text-sm text-[#6e6e73]">{m.dashboard.noOrg}</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5">
              <p className="text-sm text-[#6e6e73]">{m.dashboard.plan}</p>
              <p className="mt-2 text-xl font-semibold text-[#111]">{org.plan}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-[#6e6e73]">{m.dashboard.sites}</p>
              <p className="mt-2 text-xl font-semibold text-[#111]">
                {siteCount}
                {limits ? ` / ${limits.maxSites}` : ''}
              </p>
            </div>
            <div className="glass-card p-5">
              <Link
                href={localizePath('/dashboard/integrations', locale)}
                className="text-sm font-medium text-[#0a84ff]"
              >
                {m.dashboard.integrations}
              </Link>
            </div>
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#111]">{m.dashboard.sites}</h2>
            <Link href={localizePath('/dashboard/sites', locale)} className="text-sm text-[#0a84ff]">
              {m.dashboard.addSite}
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {siteSummaries.length === 0 && (
              <li className="glass-card p-5 text-sm text-[#6e6e73]">{m.dashboard.noScans}</li>
            )}
            {siteSummaries.map(({ site, latest }) => (
              <li key={site.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <Link
                    href={localizePath(`/dashboard/sites/${site.id}`, locale)}
                    className="font-medium text-[#111] hover:underline"
                  >
                    {site.name || site.normalizedUrl}
                  </Link>
                  <p className="text-sm text-[#6e6e73]">{site.normalizedUrl}</p>
                </div>
                <div className="text-sm text-[#6e6e73]">
                  {latest ? (
                    <>
                      {m.dashboard.latestScan}: {latest.status}
                      {latest.riskScore != null ? ` · ${latest.riskScore}/100` : ''}
                    </>
                  ) : (
                    m.dashboard.noScans
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
