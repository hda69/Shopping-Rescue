import type { Metadata } from 'next';

import { ResetPasswordPageContent } from '@/components/reset-password-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
  robots: NOINDEX_ROBOTS,
};

export default async function FrResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordPageContent locale="fr" token={params.token} />;
}
