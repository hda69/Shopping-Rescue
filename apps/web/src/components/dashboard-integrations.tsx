import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import {
  getPrimaryOrganizationForUser,
  getMerchantConnectionForOrg,
  listMerchantAccounts,
  listMerchantAccountIssues,
  selectMerchantAccount,
  softDeleteMerchantConnection,
  enqueueMerchantSync,
  getSelectedMerchantAccount,
} from '@shopping-rescue/database';
import { DashboardShell } from '@/components/dashboard-shell';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';

async function selectAccountAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const connectionId = formData.get('connectionId')?.toString() ?? '';
  const accountId = formData.get('accountId')?.toString() ?? '';
  await selectMerchantAccount(connectionId, accountId);
  redirect(localizePath('/dashboard/integrations', locale));
}

async function syncAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const connectionId = formData.get('connectionId')?.toString() ?? '';
  const organizationId = formData.get('organizationId')?.toString() ?? '';
  await enqueueMerchantSync({ organizationId, connectionId });
  redirect(localizePath('/dashboard/integrations', locale));
}

async function disconnectAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const connectionId = formData.get('connectionId')?.toString() ?? '';
  await softDeleteMerchantConnection(connectionId);
  redirect(localizePath('/dashboard/integrations', locale));
}

export async function DashboardIntegrationsPage({
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
  const connection = org ? await getMerchantConnectionForOrg(org.id) : null;
  const accounts = connection ? await listMerchantAccounts(connection.id) : [];
  const selected = connection ? await getSelectedMerchantAccount(connection.id) : null;
  const issues = selected ? await listMerchantAccountIssues(selected.id, 30) : [];

  return (
    <DashboardShell locale={locale}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111]">
          {m.dashboard.integrations}
        </h1>

        {!org || (org.plan !== 'monitoring_pro' && org.plan !== 'agency') ? (
          <p className="glass-card mt-8 p-6 text-sm text-[#6e6e73]">{m.dashboard.noOrg}</p>
        ) : !connection ? (
          <div className="glass-card mt-8 space-y-4 p-6">
            <p className="text-sm text-[#6e6e73]">{m.dashboard.mcNotConnected}</p>
            <Link
              href={`/api/oauth/google?locale=${locale}`}
              className="btn-glass-accent inline-block"
            >
              {m.dashboard.connectMc}
            </Link>
            {error && <p className="text-sm text-amber-700">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="glass-card p-6">
              <p className="text-sm text-[#6e6e73]">
                {m.dashboard.mcConnected}{' '}
                <span className="font-medium text-[#111]">{connection.googleAccountEmail}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={syncAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="connectionId" value={connection.id} />
                  <input type="hidden" name="organizationId" value={org.id} />
                  <button type="submit" className="btn-glass-accent">
                    {m.dashboard.mcSync}
                  </button>
                </form>
                <form action={disconnectAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="connectionId" value={connection.id} />
                  <button type="submit" className="btn-glass">
                    {m.dashboard.disconnectMc}
                  </button>
                </form>
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-[#111]">{m.dashboard.mcSelectAccount}</h2>
                <ul className="mt-4 space-y-2">
                  {accounts.map((account) => (
                    <li key={account.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className={account.isSelected ? 'font-semibold text-[#111]' : 'text-[#6e6e73]'}>
                        {account.accountName || account.googleAccountId}
                      </span>
                      {!account.isSelected && (
                        <form action={selectAccountAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="connectionId" value={connection.id} />
                          <input type="hidden" name="accountId" value={account.id} />
                          <button type="submit" className="text-[#0a84ff]">
                            Select
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-[#111]">{m.dashboard.mcIssues}</h2>
              {issues.length === 0 ? (
                <p className="mt-3 text-sm text-[#6e6e73]">{m.dashboard.noIssues}</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {issues.map((issue) => (
                    <li key={issue.id} className="border-t border-black/5 pt-3 text-sm">
                      <p className="font-medium text-[#111]">{issue.title || issue.issueId}</p>
                      {issue.detail && <p className="mt-1 text-[#6e6e73]">{issue.detail}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
