import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('disclaimer', 'fr');

export default function FrenchDisclaimerPage() {
  return <LegalDocumentPage id="disclaimer" locale="fr" />;
}
