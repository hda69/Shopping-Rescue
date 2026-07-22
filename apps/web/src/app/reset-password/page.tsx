import type { Metadata } from 'next';

import { ResetPasswordPageContent } from '@/components/reset-password-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: NOINDEX_ROBOTS,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordPageContent locale="en" token={params.token} />;
}
