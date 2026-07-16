import type { Metadata } from 'next';

import { buildLegalMetadata, LegalDocumentPage } from '@/components/legal-document-page';

export const metadata: Metadata = buildLegalMetadata('privacy', 'fr');

export default function FrenchPrivacyPage() {
  return <LegalDocumentPage id="privacy" locale="fr" />;
}
