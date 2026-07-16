import { and, eq } from 'drizzle-orm';
import { buildRemediationChecklist } from '@shopping-rescue/shared';
import { getDb } from './client';
import { oneTimePurchases, reports, scans, webhookEvents } from './schema/index';
import { getScanFindings } from './scans';

export interface CreatePendingPurchaseInput {
  organizationId: string;
  siteId?: string;
  scanId: string;
  stripeCheckoutSessionId: string;
  plan?: string;
  amountCents: number;
  currency?: string;
}

export async function getScanForCheckout(scanId: string) {
  const db = getDb();
  const [scan] = await db.select().from(scans).where(eq(scans.id, scanId));
  return scan ?? null;
}

export async function createPendingPurchase(input: CreatePendingPurchaseInput) {
  const db = getDb();
  const [purchase] = await db
    .insert(oneTimePurchases)
    .values({
      organizationId: input.organizationId,
      siteId: input.siteId,
      scanId: input.scanId,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      plan: input.plan ?? 'full_audit',
      amountCents: input.amountCents,
      currency: input.currency ?? 'eur',
      status: 'pending',
    })
    .onConflictDoNothing({ target: oneTimePurchases.stripeCheckoutSessionId })
    .returning();

  return purchase ?? null;
}

export async function unlockScanReport(scanId: string) {
  const db = getDb();
  const now = new Date();
  const allFindings = await getScanFindings(scanId);
  const checklist = buildRemediationChecklist(allFindings);
  const narrative = checklist.length
    ? `Full audit unlocked. ${checklist.length} issue(s) detected, ordered by severity. Follow the remediation checklist to address critical and high-priority items first.`
    : 'Full audit unlocked. No issues detected in this scan.';

  await db
    .update(scans)
    .set({
      isReportUnlocked: true,
      updatedAt: now,
    })
    .where(eq(scans.id, scanId));

  await db
    .update(reports)
    .set({
      isFullAccess: true,
      visibleFindings: null,
      checklist,
      narrative,
      updatedAt: now,
    })
    .where(eq(reports.scanId, scanId));
}

export async function completePurchaseForSession(
  stripeCheckoutSessionId: string,
  stripePaymentIntentId: string | null,
) {
  const db = getDb();
  const now = new Date();

  const [purchase] = await db
    .update(oneTimePurchases)
    .set({
      status: 'completed',
      stripePaymentIntentId: stripePaymentIntentId ?? undefined,
      updatedAt: now,
    })
    .where(eq(oneTimePurchases.stripeCheckoutSessionId, stripeCheckoutSessionId))
    .returning();

  if (!purchase?.scanId) {
    return null;
  }

  await unlockScanReport(purchase.scanId);
  return purchase;
}

export type WebhookClaimResult = 'new' | 'already_processed' | 'retry';

export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<WebhookClaimResult> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(webhookEvents)
    .where(and(eq(webhookEvents.provider, 'stripe'), eq(webhookEvents.eventId, eventId)));

  if (existing) {
    return existing.status === 'processed' ? 'already_processed' : 'retry';
  }

  await db.insert(webhookEvents).values({
    provider: 'stripe',
    eventId,
    eventType,
    payload,
    status: 'received',
  });

  return 'new';
}

export async function markWebhookEventProcessed(eventId: string) {
  const db = getDb();
  await db
    .update(webhookEvents)
    .set({
      status: 'processed',
      processedAt: new Date(),
    })
    .where(and(eq(webhookEvents.provider, 'stripe'), eq(webhookEvents.eventId, eventId)));
}

export async function markWebhookEventFailed(eventId: string, errorMessage: string) {
  const db = getDb();
  await db
    .update(webhookEvents)
    .set({
      status: 'failed',
      errorMessage,
    })
    .where(and(eq(webhookEvents.provider, 'stripe'), eq(webhookEvents.eventId, eventId)));
}
