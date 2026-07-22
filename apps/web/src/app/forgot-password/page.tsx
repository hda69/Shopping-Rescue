import type { Metadata } from 'next';

import { ForgotPasswordPageContent } from '@/components/forgot-password-page';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: NOINDEX_ROBOTS,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent locale="en" />;
}
