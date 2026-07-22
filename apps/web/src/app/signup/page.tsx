import type { Metadata } from 'next';

import { SignupPageContent } from '@/components/signup-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Create account',
  robots: NOINDEX_ROBOTS,
};

export default function SignupPage() {
  return <SignupPageContent locale="en" />;
}
