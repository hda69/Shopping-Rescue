import { and, desc, eq, isNull } from 'drizzle-orm';
import { getPlanLimits, generateIdempotencyKey, type PlanType } from '@shopping-rescue/shared';
import { normalizeUrl } from '@shopping-rescue/shared/validation';
import { getDb } from './client';
import { organizations, sites, scans, stripeCustomers } from './schema/index';
import {
  countManualScansToday,
  countSitesForOrganization,
  getSiteForUser,
  userHasOrganizationAccess,
} from './auth';
import { createJob } from './jobs';
import { getOrCreateSite } from './scans';

function asPlanType(plan: string): PlanType {
  if (plan === 'agency' || plan === 'monitoring_pro' || plan === 'full_audit') {
    return plan;
  }
  return 'free';
}

export async function getPrimaryOrganizationForUser(userId: string) {
  const db = getDb();
  const { organizationMembers } = await import('./schema/index');
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      plan: organizations.plan,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(
      and(eq(organizationMembers.userId, userId), isNull(organizations.deletedAt)),
    )
    .orderBy(desc(organizations.createdAt));

  const paid = rows.find((r) => r.plan === 'monitoring_pro' || r.plan === 'agency');
  return paid ?? rows[0] ?? null;
}

export async function getOrganizationStripeCustomer(organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.organizationId, organizationId))
    .limit(1);
  return row ?? null;
}

export async function addSiteForOrganization(input: {
  userId: string;
  organizationId: string;
  url: string;
}): Promise<{ siteId: string } | { error: string }> {
  const allowed = await userHasOrganizationAccess(input.userId, input.organizationId);
  if (!allowed) {
    return { error: 'forbidden' };
  }

  const db = getDb();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, input.organizationId))
    .limit(1);

  if (!org || org.isSuspended) {
    return { error: 'organization_unavailable' };
  }

  const plan = asPlanType(org.plan);
  if (plan !== 'monitoring_pro' && plan !== 'agency') {
    return { error: 'plan_required' };
  }

  const limits = getPlanLimits(plan);
  const count = await countSitesForOrganization(input.organizationId);
  if (count >= limits.maxSites) {
    return { error: 'site_limit_reached' };
  }

  let normalized: string;
  try {
    normalized = normalizeUrl(input.url);
  } catch {
    return { error: 'invalid_url' };
  }

  const site = await getOrCreateSite(input.organizationId, {
    url: normalized,
    platform: 'unknown',
    country: 'FR',
    mcIssueType: 'none',
    reviewRequests: 0,
  });

  return { siteId: site.id };
}

export async function createManualRescanJob(input: {
  userId: string;
  siteId: string;
  email: string;
  locale: 'en' | 'fr';
}): Promise<{ scanId: string; jobId: string } | { error: string }> {
  const site = await getSiteForUser(input.userId, input.siteId);
  if (!site) {
    return { error: 'forbidden' };
  }

  const plan = asPlanType(site.orgPlan);
  if (plan !== 'monitoring_pro' && plan !== 'agency') {
    return { error: 'plan_required' };
  }

  const limits = getPlanLimits(plan);
  if (limits.manualRescanPerDay <= 0) {
    return { error: 'rescan_not_allowed' };
  }

  const used = await countManualScansToday(input.siteId);
  if (used >= limits.manualRescanPerDay) {
    return { error: 'rescan_limit_reached' };
  }

  const db = getDb();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + limits.retentionDays);

  const [latest] = await db
    .select({ id: scans.id })
    .from(scans)
    .where(and(eq(scans.siteId, input.siteId), eq(scans.status, 'completed')))
    .orderBy(desc(scans.completedAt))
    .limit(1);

  const [scan] = await db
    .insert(scans)
    .values({
      organizationId: site.organizationId,
      siteId: site.id,
      scanType: 'full',
      status: 'pending',
      isReportUnlocked: true,
      visitorEmail: input.email,
      visitorLocale: input.locale,
      previousScanId: latest?.id ?? null,
      expiresAt,
    })
    .returning();

  const job = await createJob({
    jobType: 'WEEKLY_MONITORING_SCAN',
    organizationId: site.organizationId,
    siteId: site.id,
    scanId: scan!.id,
    idempotencyKey: generateIdempotencyKey(`manual_rescan_${site.id}`),
    payload: {
      url: site.normalizedUrl,
      scanType: 'full',
      visitorEmail: input.email,
      visitorLocale: input.locale,
      previousScanId: latest?.id ?? null,
    },
  });

  if (!job) {
    return { error: 'job_conflict' };
  }

  return { scanId: scan!.id, jobId: job.id };
}

export async function getLatestScanForSite(siteId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(scans)
    .where(eq(scans.siteId, siteId))
    .orderBy(desc(scans.createdAt))
    .limit(1);
  return row ?? null;
}
