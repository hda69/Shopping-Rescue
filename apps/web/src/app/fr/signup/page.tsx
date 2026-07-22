import type { Metadata } from 'next';

import { SignupPageContent } from '@/components/signup-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Créer un compte',
  robots: NOINDEX_ROBOTS,
};

export default function FrenchSignupPage() {
  return <SignupPageContent locale="fr" />;
}
