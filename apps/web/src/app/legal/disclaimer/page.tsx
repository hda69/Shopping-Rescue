import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('disclaimer', 'en');

export default function DisclaimerPage() {
  return <LegalDocumentPage id="disclaimer" locale="en" />;
}
