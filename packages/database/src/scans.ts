import { eq, desc, and } from 'drizzle-orm';
import { getDb } from './client';
import {
  organizations,
  sites,
  scans,
  scanPages,
  scanProducts,
  findings,
  reports,
} from './schema/index';
import {
  GUEST_ORGANIZATION_ID,
  GUEST_ORGANIZATION_SLUG,
} from '@shopping-rescue/shared/config/guest';
import type { FreeScanInput } from '@shopping-rescue/shared/validation';
import { normalizeUrl } from '@shopping-rescue/shared/validation';
import { getPlanLimits } from '@shopping-rescue/shared/config';
import { getRiskLevel } from '@shopping-rescue/shared/config';
import { calculateConfidenceLevel } from '@shopping-rescue/shared/utils/scoring';
import { createJob } from './jobs';
import { generateIdempotencyKey } from '@shopping-rescue/shared';

export interface CreateFreeScanResult {
  scanId: string;
  jobId: string;
  siteId: string;
  status: string;
}

export async function ensureGuestOrganization() {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, GUEST_ORGANIZATION_ID));

  if (existing) return existing;

  const [org] = await db
    .insert(organizations)
    .values({
      id: GUEST_ORGANIZATION_ID,
      name: 'Guest Scans',
      slug: GUEST_ORGANIZATION_SLUG,
      plan: 'free',
    })
    .onConflictDoNothing()
    .returning();

  if (org) return org;

  const [fallback] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, GUEST_ORGANIZATION_ID));
  return fallback!;
}

export async function getOrCreateSite(
  organizationId: string,
  input: Pick<FreeScanInput, 'url' | 'platform' | 'country' | 'mcIssueType' | 'reviewRequests'>,
) {
  const db = getDb();
  const normalizedUrl = normalizeUrl(input.url);

  const [existing] = await db
    .select()
    .from(sites)
    .where(
      and(eq(sites.organizationId, organizationId), eq(sites.normalizedUrl, normalizedUrl)),
    );

  if (existing) {
    await db
      .update(sites)
      .set({
        platform: input.platform,
        country: input.country,
        mcIssueType: input.mcIssueType,
        reviewRequests: input.reviewRequests,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, existing.id));
    return existing;
  }

  const [site] = await db
    .insert(sites)
    .values({
      organizationId,
      url: input.url,
      normalizedUrl,
      platform: input.platform,
      country: input.country,
      mcIssueType: input.mcIssueType,
      reviewRequests: input.reviewRequests,
      ownershipStatus: 'unverified',
    })
    .returning();

  return site!;
}

export async function createFreeScan(input: FreeScanInput): Promise<CreateFreeScanResult> {
  const db = getDb();
  const org = await ensureGuestOrganization();
  const site = await getOrCreateSite(org.id, input);
  const limits = getPlanLimits('free');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + limits.retentionDays);

  const [scan] = await db
    .insert(scans)
    .values({
      organizationId: org.id,
      siteId: site.id,
      scanType: 'free',
      status: 'queued',
      visitorEmail: input.email,
      visitorLocale: input.locale ?? 'en',
      expiresAt,
      isReportUnlocked: false,
    })
    .returning();

  const idempotencyKey = generateIdempotencyKey(`free_scan_${scan!.id}`);

  const job = await createJob({
    jobType: 'FREE_SITE_SCAN',
    organizationId: org.id,
    siteId: site.id,
    scanId: scan!.id,
    idempotencyKey,
    payload: {
      url: site.normalizedUrl,
      scanType: 'free',
      visitorEmail: input.email,
      visitorLocale: input.locale ?? 'en',
    },
  });

  return {
    scanId: scan!.id,
    jobId: job?.id ?? scan!.id,
    siteId: site.id,
    status: 'queued',
  };
}

export async function getScanById(scanId: string) {
  const db = getDb();
  const [scan] = await db.select().from(scans).where(eq(scans.id, scanId));
  return scan;
}

export async function getScanWithSite(scanId: string) {
  const db = getDb();
  const [row] = await db
    .select({ scan: scans, site: sites })
    .from(scans)
    .innerJoin(sites, eq(scans.siteId, sites.id))
    .where(eq(scans.id, scanId));
  return row;
}

export async function getScanFindings(scanId: string, limit?: number) {
  const db = getDb();
  const query = db
    .select()
    .from(findings)
    .where(eq(findings.scanId, scanId))
    .orderBy(desc(findings.createdAt));

  if (limit) {
    return query.limit(limit);
  }
  return query;
}

export async function getScanReport(scanId: string) {
  const db = getDb();
  const [report] = await db.select().from(reports).where(eq(reports.scanId, scanId));
  return report;
}

export interface PageInput {
  url: string;
  normalizedUrl: string;
  pageType?: string;
  httpStatus?: number;
  title?: string;
  metaDescription?: string;
  language?: string;
  contentHash?: string;
  jsonLd?: unknown[];
  visibleText?: string;
  responseTimeMs?: number;
}

export interface ProductInput {
  url: string;
  title?: string;
  price?: string | null;
  currency?: string;
  availability?: string;
  jsonLdPrice?: string | null;
  jsonLdAvailability?: string;
  imageUrl?: string;
  description?: string;
}

export async function saveCrawlResults(
  scanId: string,
  pages: PageInput[],
  products: ProductInput[],
) {
  const db = getDb();

  // Idempotent retries: clear prior crawl rows for this scan before insert.
  await db.delete(scanProducts).where(eq(scanProducts.scanId, scanId));
  await db.delete(scanPages).where(eq(scanPages.scanId, scanId));

  const uniquePages = new Map<string, PageInput>();
  for (const page of pages) {
    if (!uniquePages.has(page.normalizedUrl)) {
      uniquePages.set(page.normalizedUrl, page);
    }
  }

  const pagesToInsert = [...uniquePages.values()];
  if (pagesToInsert.length > 0) {
    await db.insert(scanPages).values(
      pagesToInsert.map((p) => ({
        scanId,
        url: p.url,
        normalizedUrl: p.normalizedUrl,
        pageType: p.pageType,
        httpStatus: p.httpStatus,
        title: p.title,
        metaDescription: p.metaDescription,
        language: p.language,
        contentHash: p.contentHash,
        jsonLd: p.jsonLd,
        visibleText: p.visibleText?.slice(0, 50000),
        responseTimeMs: p.responseTimeMs,
      })),
    );
  }

  const uniqueProducts = new Map<string, ProductInput>();
  for (const product of products) {
    if (!uniqueProducts.has(product.url)) {
      uniqueProducts.set(product.url, product);
    }
  }

  const productsToInsert = [...uniqueProducts.values()];
  if (productsToInsert.length > 0) {
    await db.insert(scanProducts).values(
      productsToInsert.map((p) => ({
        scanId,
        url: p.url,
        title: p.title,
        price: p.price ?? null,
        currency: p.currency,
        availability: p.availability,
        jsonLdPrice: p.jsonLdPrice ?? null,
        jsonLdAvailability: p.jsonLdAvailability,
        imageUrl: p.imageUrl,
        description: p.description?.slice(0, 5000),
      })),
    );
  }
}

export interface FindingInput {
  ruleId: string;
  ruleVersion: number;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  affectedUrl?: string;
  evidence: Record<string, unknown>;
  explanation: string;
  recommendation: string;
}

export async function saveFindings(scanId: string, findingInputs: FindingInput[]) {
  const db = getDb();
  await db.delete(findings).where(eq(findings.scanId, scanId));
  if (findingInputs.length === 0) return [];

  const inserted = await db
    .insert(findings)
    .values(
      findingInputs.map((f) => ({
        scanId,
        ruleId: f.ruleId,
        ruleVersion: f.ruleVersion,
        title: f.title,
        category: f.category,
        severity: f.severity,
        confidence: f.confidence.toFixed(2),
        affectedUrl: f.affectedUrl,
        evidence: f.evidence,
        explanation: f.explanation,
        recommendation: f.recommendation,
        status: 'open',
      })),
    )
    .returning();

  return inserted;
}

export async function completeScan(
  scanId: string,
  data: {
    riskScore: number;
    pagesCrawled: number;
    productsAnalyzed: number;
    rulesVersion: string;
    totalFindings: number;
  },
) {
  const db = getDb();
  const limits = getPlanLimits('free');
  const riskLevel = getRiskLevel(data.riskScore);
  const confidenceLevel = calculateConfidenceLevel(
    data.totalFindings,
    data.pagesCrawled,
    false,
  );

  const [scan] = await db
    .update(scans)
    .set({
      status: 'completed',
      riskScore: data.riskScore,
      riskLevel,
      confidenceLevel,
      pagesCrawled: data.pagesCrawled,
      productsAnalyzed: data.productsAnalyzed,
      rulesVersion: data.rulesVersion,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scans.id, scanId))
    .returning();

  const scanRow = await getScanWithSite(scanId);
  if (scanRow) {
    await db
      .insert(reports)
      .values({
        scanId,
        organizationId: scanRow.scan.organizationId!,
        summary: `Risk score: ${data.riskScore}/100 (${riskLevel}). ${data.totalFindings} issue(s) detected.`,
        isFullAccess: false,
        visibleFindings: limits.visibleFindings,
      })
      .onConflictDoNothing({ target: reports.scanId });
  }

  return scan;
}

export async function failScan(scanId: string, errorMessage: string) {
  const db = getDb();
  await db
    .update(scans)
    .set({
      status: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(scans.id, scanId));
  return errorMessage;
}

export async function updateScanStatus(scanId: string, status: string) {
  const db = getDb();
  await db
    .update(scans)
    .set({ status, startedAt: status === 'running' ? new Date() : undefined, updatedAt: new Date() })
    .where(eq(scans.id, scanId));
}
