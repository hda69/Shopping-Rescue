import { LoginPageContent } from '@/components/login-page';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <LoginPageContent locale="en" error={params.error} />;
}
