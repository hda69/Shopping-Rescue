import { DashboardSitesPage } from '@/components/dashboard-sites';

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardSitesPage locale="en" error={params.error} />;
}
