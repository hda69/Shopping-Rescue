import { DashboardIntegrationsPage } from '@/components/dashboard-integrations';

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardIntegrationsPage locale="en" error={params.error} />;
}
