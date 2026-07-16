import { loadEnv } from '@shopping-rescue/shared/load-env';
import { createLogger } from '@shopping-rescue/shared';

loadEnv();
import { claimNextJob, closeDb, failJob } from '@shopping-rescue/database';
import { startHealthServer, stopHealthServer, getHealthPort } from './health.js';
import { getHandler } from './handlers/index.js';

const POLL_INTERVAL_MS = 2000;
const logger = createLogger({ service: 'worker' });

let isShuttingDown = false;
let currentJobPromise: Promise<void> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processJob(job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>): Promise<void> {
  const jobLogger = logger.child({ jobId: job.id, jobType: job.jobType });
  const handler = getHandler(job.jobType);

  if (!handler) {
    jobLogger.warn('No handler registered for job type');
    await failJob(job.id, `No handler registered for job type: ${job.jobType}`);
    return;
  }

  try {
    jobLogger.info('Job claimed');
    await handler(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    jobLogger.error('Job failed', { error: message });
    await failJob(job.id, message);
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message) return error.message;
    if ('code' in error && typeof error.code === 'string') return error.code;
    if (error.cause) return formatError(error.cause);
  }
  const text = String(error);
  return text === '[object Object]' ? 'Unknown database error' : text;
}

async function pollLoop(): Promise<void> {
  let consecutiveErrors = 0;
  let lastErrorLogAt = 0;
  const errorLogIntervalMs = 30_000;

  while (!isShuttingDown) {
    try {
      const job = await claimNextJob();
      consecutiveErrors = 0;

      if (job) {
        currentJobPromise = processJob(job).finally(() => {
          currentJobPromise = null;
        });
        await currentJobPromise;
        continue;
      }

      await sleep(POLL_INTERVAL_MS);
    } catch (error) {
      consecutiveErrors += 1;
      const message = formatError(error);
      const now = Date.now();

      if (consecutiveErrors === 1 || now - lastErrorLogAt >= errorLogIntervalMs) {
        logger.error('Database unavailable — worker paused between retries', {
          error: message,
          hint: 'Start Postgres with: docker compose up -d postgres',
          retries: consecutiveErrors,
        });
        lastErrorLogAt = now;
      }

      await closeDb().catch(() => undefined);

      const backoffMs = Math.min(POLL_INTERVAL_MS * 2 ** Math.min(consecutiveErrors - 1, 4), 30_000);
      await sleep(backoffMs);
    }
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;

  isShuttingDown = true;
  logger.info('Shutdown initiated', { signal });

  if (currentJobPromise) {
    logger.info('Waiting for current job to finish');
    await currentJobPromise;
  }

  await stopHealthServer();
  await closeDb();
  logger.info('Worker stopped');
  process.exit(0);
}

async function main(): Promise<void> {
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  await startHealthServer();
  logger.info('Worker started', {
    pollIntervalMs: POLL_INTERVAL_MS,
    healthPort: getHealthPort(),
  });

  await pollLoop();
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error('Worker crashed', { error: message });
  process.exit(1);
});
