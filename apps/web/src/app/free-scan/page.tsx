import type { Metadata } from 'next';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { checkDbHealth } from '@shopping-rescue/database';
import { FreeScanPageContent } from '@/components/free-scan-page';
import { getMessages } from '@/config/messages';

loadEnv();

export const dynamic = 'force-dynamic';

const m = getMessages('en');

export const metadata: Metadata = {
  title: m.meta.freeScanTitle,
};

export default async function FreeScanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; issue?: string; platform?: string; message?: string }>;
}) {
  const params = await searchParams;
  const dbHealth = await checkDbHealth();

  return (
    <FreeScanPageContent
      locale="en"
      error={params.error}
      message={params.message}
      issue={params.issue}
      platform={params.platform}
      dbOfflineMessage={dbHealth.ok ? undefined : dbHealth.message}
    />
  );
}
