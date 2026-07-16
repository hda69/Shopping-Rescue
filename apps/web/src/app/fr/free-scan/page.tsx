import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { checkDbHealth } from '@shopping-rescue/database';
import { FreeScanPageContent } from '@/components/free-scan-page';
import { getMessages } from '@/config/messages';

loadEnv();

export const dynamic = 'force-dynamic';

const m = getMessages('fr');

export const metadata: Metadata = {
  title: m.meta.freeScanTitle,
  alternates: {
    canonical: '/fr/free-scan',
    languages: {
      en: '/free-scan',
      fr: '/fr/free-scan',
    },
  },
};

export default async function FrenchFreeScanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; issue?: string; platform?: string; message?: string }>;
}) {
  const params = await searchParams;
  const dbHealth = await checkDbHealth();

  return (
    <FreeScanPageContent
      locale="fr"
      error={params.error}
      message={params.message}
      issue={params.issue}
      platform={params.platform}
      dbOfflineMessage={dbHealth.ok ? undefined : dbHealth.message}
    />
  );
}
