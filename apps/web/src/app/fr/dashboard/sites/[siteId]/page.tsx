import { DashboardSiteDetail } from '@/components/dashboard-site-detail';

export default async function FrSiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId } = await params;
  const query = await searchParams;
  return <DashboardSiteDetail locale="fr" siteId={siteId} error={query.error} />;
}
