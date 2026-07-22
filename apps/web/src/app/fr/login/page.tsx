import type { Metadata } from 'next';

import { LoginPageContent } from '@/components/login-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: NOINDEX_ROBOTS,
};

export default function FrenchLoginPage() {
  return <LoginPageContent locale="fr" />;
}
