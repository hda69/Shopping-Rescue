import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('terms', 'fr');

export default function FrenchTermsPage() {
  return <LegalDocumentPage id="terms" locale="fr" />;
}
