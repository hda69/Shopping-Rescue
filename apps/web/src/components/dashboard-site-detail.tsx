import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import {
  createManualRescanJob,
  getSiteForUser,
  listScansForSite,
} from '@shopping-rescue/database';
import { DashboardShell } from '@/components/dashboard-shell';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';

async function rescanAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const siteId = formData.get('siteId')?.toString() ?? '';
  const session = await getSessionFromCookies();
  if (!session) redirect(localizePath('/login', locale));

  const result = await createManualRescanJob({
    userId: session.userId,
    siteId,
    email: session.email,
    locale,
  });

  if ('error' in result) {
    redirect(`${localizePath(`/dashboard/sites/${siteId}`, locale)}?error=${result.error}`);
  }

  redirect(localizePath(`/scan/${result.scanId}`, locale));
}

export async function DashboardSiteDetail({
  locale,
  siteId,
  error,
}: {
  locale: AppLocale;
  siteId: string;
  error?: string;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect(localizePath('/login', locale));

  const site = await getSiteForUser(session.userId, siteId);
  if (!site) notFound();

  const m = getMessages(locale);
  const history = await listScansForSite(siteId, 30);

  return (
    <DashboardShell locale={locale}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111]">
          {site.name || site.normalizedUrl}
        </h1>
        <p className="mt-2 text-[#6e6e73]">{site.normalizedUrl}</p>

        <form action={rescanAction} className="mt-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="siteId" value={siteId} />
          <button type="submit" className="btn-glass-accent">
            {m.dashboard.rescan}
          </button>
          {error === 'rescan_limit_reached' && (
            <p className="mt-2 text-sm text-amber-700">{m.dashboard.rescanLimit}</p>
          )}
        </form>

        <h2 className="mt-10 text-xl font-semibold text-[#111]">{m.dashboard.history}</h2>
        <ul className="mt-4 space-y-3">
          {history.length === 0 && (
            <li className="glass-card p-5 text-sm text-[#6e6e73]">{m.dashboard.noScans}</li>
          )}
          {history.map((scan) => (
            <li key={scan.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="text-sm text-[#6e6e73]">
                <span className="font-medium text-[#111]">{m.dashboard.status}:</span> {scan.status}
                {scan.riskScore != null && (
                  <>
                    {' · '}
                    <span className="font-medium text-[#111]">{m.dashboard.risk}:</span> {scan.riskScore}/100
                  </>
                )}
              </div>
              <Link href={localizePath(`/scan/${scan.id}`, locale)} className="text-sm text-[#0a84ff]">
                {m.dashboard.viewScan}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}
