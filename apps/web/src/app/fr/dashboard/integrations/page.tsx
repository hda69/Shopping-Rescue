import { DashboardIntegrationsPage } from '@/components/dashboard-integrations';

export default async function FrIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardIntegrationsPage locale="fr" error={params.error} />;
}
