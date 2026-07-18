import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  createMonitoringScanJob,
  listMonitoringSitesDueForScan,
} from '@shopping-rescue/database';
import { createLogger } from '@shopping-rescue/shared';
import { NextResponse } from 'next/server';

loadEnv();

export const dynamic = 'force-dynamic';

const logger = createLogger({ service: 'cron-weekly-scans' });

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Allow in development without secret for local testing
    return process.env.NODE_ENV !== 'production';
  }

  const header = request.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get('secret') === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await listMonitoringSitesDueForScan();
  const queued: Array<{ siteId: string; scanId: string; jobId: string }> = [];

  for (const site of due) {
    if (!site.email) {
      logger.warn('Skipping monitoring site without email', { siteId: site.siteId });
      continue;
    }

    const created = await createMonitoringScanJob({
      organizationId: site.organizationId,
      siteId: site.siteId,
      siteUrl: site.siteUrl,
      email: site.email,
      locale: site.locale,
      previousScanId: site.previousScanId,
    });

    queued.push({
      siteId: site.siteId,
      scanId: created.scanId,
      jobId: created.jobId,
    });
  }

  logger.info('Weekly monitoring cron completed', {
    due: due.length,
    queued: queued.length,
  });

  return NextResponse.json({
    ok: true,
    due: due.length,
    queued: queued.length,
    jobs: queued,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
