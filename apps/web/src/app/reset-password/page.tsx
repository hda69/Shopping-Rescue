import { ResetPasswordPageContent } from '@/components/reset-password-page';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordPageContent locale="en" token={params.token} />;
}
