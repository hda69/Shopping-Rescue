import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('terms', 'en');

export default function TermsPage() {
  return <LegalDocumentPage id="terms" locale="en" />;
}
