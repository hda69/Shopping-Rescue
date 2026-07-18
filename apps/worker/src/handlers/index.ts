import type { JobType } from '@shopping-rescue/shared';
import type { scanJobs } from '@shopping-rescue/database';
import { handleFreeSiteScan } from './free-site-scan.js';
import { handleWeeklyMonitoringScan } from './weekly-monitoring-scan.js';
import { handleMerchantSync } from './merchant-sync.js';

export type JobRecord = typeof scanJobs.$inferSelect;

export type JobHandler = (job: JobRecord) => Promise<void>;

const handlers: Partial<Record<JobType, JobHandler>> = {
  FREE_SITE_SCAN: handleFreeSiteScan,
  WEEKLY_MONITORING_SCAN: handleWeeklyMonitoringScan,
  MERCHANT_SYNC: handleMerchantSync,
};

export function getHandler(jobType: string): JobHandler | undefined {
  return handlers[jobType as JobType];
}

export function getRegisteredJobTypes(): JobType[] {
  return Object.keys(handlers) as JobType[];
}
