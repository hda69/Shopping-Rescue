import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { checkDbHealth } from '@shopping-rescue/database';
import { FreeScanPageContent } from '@/components/free-scan-page';
import { getMessages } from '@/config/messages';
import { buildPublicPageMetadata } from '@/lib/seo';

loadEnv();

export const dynamic = 'force-dynamic';

const m = getMessages('fr');

export const metadata: Metadata = buildPublicPageMetadata({
  title: m.meta.freeScanTitle,
  description: m.meta.freeScanDescription,
  path: '/free-scan',
  locale: 'fr',
});

export default async function FrenchFreeScanPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    issue?: string;
    platform?: string;
    message?: string;
    url?: string;
    email?: string;
  }>;
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
      url={params.url}
      email={params.email}
      dbOfflineMessage={dbHealth.ok ? undefined : dbHealth.message}
    />
  );
}
