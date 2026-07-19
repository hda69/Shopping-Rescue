import { ResetPasswordPageContent } from '@/components/reset-password-page';

export default async function FrResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordPageContent locale="fr" token={params.token} />;
}
