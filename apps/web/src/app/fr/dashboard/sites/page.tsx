import { DashboardSitesPage } from '@/components/dashboard-sites';

export default async function FrSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardSitesPage locale="fr" error={params.error} />;
}
