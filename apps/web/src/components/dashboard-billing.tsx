import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@shopping-rescue/auth';
import { createBillingPortalSession } from '@shopping-rescue/billing';
import {
  getPrimaryOrganizationForUser,
  getOrganizationStripeCustomer,
} from '@shopping-rescue/database';
import { DashboardShell } from '@/components/dashboard-shell';
import { getMessages } from '@/config/messages';
import { localizePath, type AppLocale } from '@/lib/locale';

async function openPortalAction(formData: FormData) {
  'use server';
  const locale = (formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en') as AppLocale;
  const session = await getSessionFromCookies();
  if (!session) redirect(localizePath('/login', locale));

  const org = await getPrimaryOrganizationForUser(session.userId);
  if (!org) redirect(`${localizePath('/dashboard/billing', locale)}?error=no_customer`);

  const customer = await getOrganizationStripeCustomer(org.id);
  if (!customer) redirect(`${localizePath('/dashboard/billing', locale)}?error=no_customer`);

  const portal = await createBillingPortalSession({
    stripeCustomerId: customer.stripeCustomerId,
    locale,
  });
  redirect(portal.url);
}

export async function DashboardBillingPage({
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
  const customer = org ? await getOrganizationStripeCustomer(org.id) : null;

  return (
    <DashboardShell locale={locale}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.dashboard.billing}</h1>
        {org && (
          <p className="mt-2 text-[#6e6e73]">
            {m.dashboard.plan}: <span className="font-medium text-[#111]">{org.plan}</span>
          </p>
        )}

        {!customer ? (
          <p className="glass-card mt-8 p-6 text-sm text-[#6e6e73]">{m.dashboard.billingUnavailable}</p>
        ) : (
          <form action={openPortalAction} className="mt-8">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="btn-glass-accent">
              {m.dashboard.manageBilling}
            </button>
          </form>
        )}

        {(error === 'no_customer' || error === 'no_org') && (
          <p className="mt-4 text-sm text-amber-700">{m.dashboard.billingUnavailable}</p>
        )}
      </div>
    </DashboardShell>
  );
}
