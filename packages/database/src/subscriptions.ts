import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getPlanLimits, generateIdempotencyKey } from '@shopping-rescue/shared';
import { getDb } from './client';
import {
  organizations,
  sites,
  scans,
  subscriptions,
  stripeCustomers,
  findings,
} from './schema/index';
import { createJob } from './jobs';
import { getScanWithSite } from './scans';
import { unlockScanReport } from './billing';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export async function prepareMonitoringCheckoutFromScan(scanId: string): Promise<{
  organizationId: string;
  siteId: string;
  email: string;
  locale: 'en' | 'fr';
  siteUrl: string;
}> {
  const row = await getScanWithSite(scanId);
  if (!row) {
    throw new Error('Scan not found');
  }

  const { scan, site } = row;
  if (scan.status !== 'completed') {
    throw new Error('Scan is not complete yet');
  }
  if (!scan.visitorEmail) {
    throw new Error('Scan is missing visitor email');
  }

  const db = getDb();
  const email = scan.visitorEmail.trim().toLowerCase();
  const baseSlug = `mon-${slugify(email.split('@')[0] || 'subscriber')}-${Date.now().toString(36)}`;

  const [org] = await db
    .insert(organizations)
    .values({
      name: `Monitoring — ${email}`,
      slug: baseSlug,
      plan: 'free',
    })
    .returning();

  if (!org) {
    throw new Error('Failed to create monitoring organization');
  }

  const [monitoringSite] = await db
    .insert(sites)
    .values({
      organizationId: org.id,
      url: site.url,
      normalizedUrl: site.normalizedUrl,
      name: site.name,
      platform: site.platform,
      country: site.country,
      mcIssueType: site.mcIssueType,
      reviewRequests: site.reviewRequests,
      ownershipStatus: 'unverified',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  let siteId = monitoringSite?.id;
  if (!siteId) {
    const [existing] = await db
      .select()
      .from(sites)
      .where(
        and(eq(sites.organizationId, org.id), eq(sites.normalizedUrl, site.normalizedUrl)),
      );
    siteId = existing?.id;
  }

  if (!siteId) {
    throw new Error('Failed to attach site to monitoring organization');
  }

  return {
    organizationId: org.id,
    siteId,
    email,
    locale: scan.visitorLocale === 'fr' ? 'fr' : 'en',
    siteUrl: site.normalizedUrl,
  };
}

export async function upsertStripeCustomer(input: {
  organizationId: string;
  stripeCustomerId: string;
  email: string;
}) {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.organizationId, input.organizationId));

  if (existing) {
    const [updated] = await db
      .update(stripeCustomers)
      .set({
        stripeCustomerId: input.stripeCustomerId,
        email: input.email,
        updatedAt: now,
      })
      .where(eq(stripeCustomers.id, existing.id))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(stripeCustomers)
    .values({
      organizationId: input.organizationId,
      stripeCustomerId: input.stripeCustomerId,
      email: input.email,
    })
    .returning();
  return created!;
}

export async function activateMonitoringSubscription(input: {
  organizationId: string;
  siteId: string;
  scanId?: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  email: string;
  status: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const db = getDb();
  const now = new Date();

  await upsertStripeCustomer({
    organizationId: input.organizationId,
    stripeCustomerId: input.stripeCustomerId,
    email: input.email,
  });

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, input.stripeSubscriptionId));

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        status: input.status,
        currentPeriodStart: input.currentPeriodStart ?? existing.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      organizationId: input.organizationId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      plan: 'monitoring_pro',
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    });
  }

  const active = ['active', 'trialing'].includes(input.status);
  await db
    .update(organizations)
    .set({
      plan: active ? 'monitoring_pro' : 'free',
      updatedAt: now,
    })
    .where(eq(organizations.id, input.organizationId));

  if (input.scanId && active) {
    await unlockScanReport(input.scanId);
  }

  return { organizationId: input.organizationId, siteId: input.siteId, active };
}

export async function syncSubscriptionFromStripe(input: {
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const db = getDb();
  const now = new Date();

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, input.stripeSubscriptionId));

  if (!sub) {
    return null;
  }

  await db
    .update(subscriptions)
    .set({
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ?? sub.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd ?? sub.currentPeriodEnd,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? sub.cancelAtPeriodEnd,
      updatedAt: now,
    })
    .where(eq(subscriptions.id, sub.id));

  const active = ['active', 'trialing'].includes(input.status);
  await db
    .update(organizations)
    .set({
      plan: active ? 'monitoring_pro' : 'free',
      updatedAt: now,
    })
    .where(eq(organizations.id, sub.organizationId));

  return sub;
}

export interface MonitoringSiteDue {
  organizationId: string;
  siteId: string;
  siteUrl: string;
  email: string;
  locale: 'en' | 'fr';
  previousScanId: string | null;
}

export async function listMonitoringSitesDueForScan(): Promise<MonitoringSiteDue[]> {
  const db = getDb();
  const intervalDays = getPlanLimits('monitoring_pro').scanIntervalDays || 7;

  const activeSubs = await db
    .select({
      organizationId: subscriptions.organizationId,
      stripeCustomerId: subscriptions.stripeCustomerId,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.plan, 'monitoring_pro'),
        inArray(subscriptions.status, ['active', 'trialing']),
      ),
    );

  const due: MonitoringSiteDue[] = [];

  for (const sub of activeSubs) {
    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.organizationId, sub.organizationId));

    const orgSites = await db
      .select()
      .from(sites)
      .where(and(eq(sites.organizationId, sub.organizationId), eq(sites.isActive, true)));

    for (const site of orgSites) {
      const [latest] = await db
        .select()
        .from(scans)
        .where(and(eq(scans.siteId, site.id), eq(scans.status, 'completed')))
        .orderBy(desc(scans.completedAt))
        .limit(1);

      const completedAt = latest?.completedAt ? new Date(latest.completedAt).getTime() : 0;
      const ageMs = Date.now() - completedAt;
      const dueMs = intervalDays * 24 * 60 * 60 * 1000;

      if (!latest || ageMs >= dueMs) {
        const [latestAny] = await db
          .select({ visitorEmail: scans.visitorEmail, visitorLocale: scans.visitorLocale })
          .from(scans)
          .where(eq(scans.siteId, site.id))
          .orderBy(desc(scans.createdAt))
          .limit(1);

        due.push({
          organizationId: sub.organizationId,
          siteId: site.id,
          siteUrl: site.normalizedUrl,
          email: customer?.email ?? latestAny?.visitorEmail ?? '',
          locale: latestAny?.visitorLocale === 'fr' ? 'fr' : 'en',
          previousScanId: latest?.id ?? null,
        });
      }
    }
  }

  return due;
}

export async function createMonitoringScanJob(input: {
  organizationId: string;
  siteId: string;
  siteUrl: string;
  email: string;
  locale: 'en' | 'fr';
  previousScanId?: string | null;
}) {
  const db = getDb();
  const limits = getPlanLimits('monitoring_pro');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + limits.retentionDays);

  const [scan] = await db
    .insert(scans)
    .values({
      organizationId: input.organizationId,
      siteId: input.siteId,
      scanType: 'monitoring',
      status: 'queued',
      visitorEmail: input.email || null,
      visitorLocale: input.locale,
      previousScanId: input.previousScanId ?? null,
      isReportUnlocked: true,
      expiresAt,
    })
    .returning();

  if (!scan) {
    throw new Error('Failed to create monitoring scan');
  }

  const idempotencyKey = generateIdempotencyKey(
    `weekly_monitoring_${input.siteId}_${new Date().toISOString().slice(0, 10)}`,
  );

  const job = await createJob({
    jobType: 'WEEKLY_MONITORING_SCAN',
    organizationId: input.organizationId,
    siteId: input.siteId,
    scanId: scan.id,
    idempotencyKey,
    payload: {
      url: input.siteUrl,
      scanType: 'monitoring',
      visitorEmail: input.email,
      visitorLocale: input.locale,
      previousScanId: input.previousScanId ?? null,
    },
  });

  return { scanId: scan.id, jobId: job?.id ?? scan.id };
}

export async function compareFindingsForAlert(scanId: string, previousScanId: string | null) {
  const db = getDb();
  const current = await db.select().from(findings).where(eq(findings.scanId, scanId));

  if (!previousScanId) {
    return current.filter((f) => f.severity === 'critical' || f.severity === 'high');
  }

  const previous = await db.select().from(findings).where(eq(findings.scanId, previousScanId));
  const previousKeys = new Set(
    previous.map((f) => `${f.ruleId}::${f.affectedUrl ?? ''}`),
  );

  return current.filter((f) => {
    if (f.severity !== 'critical' && f.severity !== 'high') return false;
    return !previousKeys.has(`${f.ruleId}::${f.affectedUrl ?? ''}`);
  });
}

export async function countActiveMonitoringSubscriptions() {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM subscriptions
    WHERE plan = 'monitoring_pro'
      AND status IN ('active', 'trialing')
  `);
  return (result[0] as { count?: number } | undefined)?.count ?? 0;
}
