import { DashboardSiteDetail } from '@/components/dashboard-site-detail';

export default async function SiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId } = await params;
  const query = await searchParams;
  return <DashboardSiteDetail locale="en" siteId={siteId} error={query.error} />;
}
