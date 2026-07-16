import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('privacy', 'en');

export default function PrivacyPage() {
  return <LegalDocumentPage id="privacy" locale="en" />;
}
