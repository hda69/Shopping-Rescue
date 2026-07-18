import { DashboardBillingPage } from '@/components/dashboard-billing';

export default async function FrBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardBillingPage locale="fr" error={params.error} />;
}
