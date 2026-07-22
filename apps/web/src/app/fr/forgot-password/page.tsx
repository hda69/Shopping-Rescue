import type { Metadata } from 'next';

import { ForgotPasswordPageContent } from '@/components/forgot-password-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  robots: NOINDEX_ROBOTS,
};

export default function FrForgotPasswordPage() {
  return <ForgotPasswordPageContent locale="fr" />;
}
