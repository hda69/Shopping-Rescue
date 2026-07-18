import { LoginPageContent } from '@/components/login-page';

export default async function FrLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <LoginPageContent locale="fr" error={params.error} />;
}
