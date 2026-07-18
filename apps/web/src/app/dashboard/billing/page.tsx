import { DashboardBillingPage } from '@/components/dashboard-billing';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <DashboardBillingPage locale="en" error={params.error} />;
}
