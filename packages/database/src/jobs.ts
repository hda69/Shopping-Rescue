import { eq, and, sql, desc } from 'drizzle-orm';
import { getDb } from './client';
import { scanJobs } from './schema/index';
import type { JobType, JobStatus } from '@shopping-rescue/shared';

export interface CreateJobInput {
  jobType: JobType;
  organizationId?: string;
  siteId?: string;
  scanId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  priority?: number;
  scheduledAt?: Date;
}

export async function createJob(input: CreateJobInput) {
  const db = getDb();
  const [job] = await db
    .insert(scanJobs)
    .values({
      jobType: input.jobType,
      organizationId: input.organizationId,
      siteId: input.siteId,
      scanId: input.scanId,
      payload: input.payload ?? {},
      idempotencyKey: input.idempotencyKey,
      priority: input.priority ?? 0,
      scheduledAt: input.scheduledAt ?? new Date(),
      status: 'queued',
    })
    .onConflictDoNothing({ target: scanJobs.idempotencyKey })
    .returning();
  return job;
}

export async function claimNextJob() {
  const db = getDb();
  const result = await db.execute(sql`
    UPDATE scan_jobs
    SET status = 'running', started_at = now(), updated_at = now(),
        attempts = attempts + 1
    WHERE id = (
      SELECT id FROM scan_jobs
      WHERE status = 'queued'
        AND scheduled_at <= now()
        AND attempts < max_attempts
      ORDER BY priority DESC, scheduled_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  `);

  const claimedId = (result[0] as { id?: string } | undefined)?.id;
  if (!claimedId) return undefined;

  const [job] = await db.select().from(scanJobs).where(eq(scanJobs.id, claimedId));
  return job;
}

export async function updateJobProgress(
  jobId: string,
  progress: number,
  status?: JobStatus,
) {
  const db = getDb();
  await db
    .update(scanJobs)
    .set({
      progress,
      ...(status ? { status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, jobId));
}

export async function completeJob(jobId: string) {
  const db = getDb();
  await db
    .update(scanJobs)
    .set({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, jobId));
}

export async function failJob(jobId: string, errorMessage: string) {
  const db = getDb();
  const db2 = getDb();
  const [job] = await db2.select().from(scanJobs).where(eq(scanJobs.id, jobId));

  if (!job) return;

  const newStatus = job.attempts >= job.maxAttempts ? 'failed' : 'queued';
  const scheduledAt =
    newStatus === 'queued'
      ? new Date(Date.now() + Math.pow(2, job.attempts) * 1000)
      : undefined;

  await db
    .update(scanJobs)
    .set({
      status: newStatus,
      errorMessage,
      scheduledAt: scheduledAt ?? job.scheduledAt,
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, jobId));
}

export async function getQueuedJobCount() {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scanJobs)
    .where(eq(scanJobs.status, 'queued'));
  return result?.count ?? 0;
}

export async function getScanJobByScanId(scanId: string) {
  const db = getDb();
  const [job] = await db
    .select()
    .from(scanJobs)
    .where(eq(scanJobs.scanId, scanId))
    .orderBy(desc(scanJobs.createdAt))
    .limit(1);
  return job;
}
