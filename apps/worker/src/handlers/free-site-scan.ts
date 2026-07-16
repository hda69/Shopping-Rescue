import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  completeJob,
  failJob,
  updateJobProgress,
  getScanWithSite,
  updateScanStatus,
  saveCrawlResults,
  saveFindings,
  completeScan,
  failScan,
} from '@shopping-rescue/database';
import {
  createLogger,
  calculateRiskScore,
  getPlanLimits,
} from '@shopping-rescue/shared';
import { sendScanCompletedEmail } from '@shopping-rescue/email';
import { crawlSite } from '@shopping-rescue/scanner';
import { evaluateSiteRules, RULES_VERSION } from '@shopping-rescue/rules-engine';
import type { JobRecord } from './index.js';

loadEnv();

export async function handleFreeSiteScan(job: JobRecord): Promise<void> {
  const logger = createLogger({ jobId: job.id, jobType: 'FREE_SITE_SCAN' });
  const scanId = job.scanId;

  if (!scanId) {
    await failJob(job.id, 'Missing scanId on job');
    return;
  }

  try {
    const row = await getScanWithSite(scanId);
    if (!row) {
      await failJob(job.id, `Scan not found: ${scanId}`);
      return;
    }

    const { scan, site } = row;
    const limits = getPlanLimits('free');
    const url = site.normalizedUrl;

    logger.info('Starting free site scan', { scanId, url });
    await updateScanStatus(scanId, 'running');
    await updateJobProgress(job.id, 10);
    let crawlProgress = 10;

    const crawlResult = await crawlSite(url, {
      maxPages: limits.maxPages,
      maxProducts: limits.maxProducts,
      onProgress: async ({ processedPages, maxPages }) => {
        const ratio = Math.min(1, processedPages / Math.max(1, maxPages));
        const next = Math.min(60, 10 + Math.floor(ratio * 50));
        if (next > crawlProgress) {
          crawlProgress = next;
          await updateJobProgress(job.id, next);
        }
      },
    });
    await updateJobProgress(job.id, 65);

    await saveCrawlResults(
      scanId,
      crawlResult.pages.map((p) => ({
        url: p.url,
        normalizedUrl: p.normalizedUrl,
        pageType: p.pageType,
        httpStatus: p.httpStatus,
        title: p.title,
        metaDescription: p.metaDescription,
        language: p.language,
        contentHash: p.contentHash,
        jsonLd: p.jsonLd,
        visibleText: p.visibleText,
        responseTimeMs: p.responseTimeMs,
      })),
      crawlResult.products.map((p) => ({
        url: p.url,
        title: p.title,
        price: p.price,
        currency: p.currency,
        availability: p.availability,
        jsonLdPrice: p.jsonLdPrice,
        jsonLdAvailability: p.jsonLdAvailability,
        imageUrl: p.imageUrl,
        description: p.description,
      })),
    );

    await updateJobProgress(job.id, 75);

    const findingInputs = evaluateSiteRules({
      scanId,
      rootUrl: crawlResult.rootUrl,
      pages: crawlResult.pages,
      products: crawlResult.products,
      robots: crawlResult.robots,
      sitemap: crawlResult.sitemap,
      platform: crawlResult.platform,
    });

    await saveFindings(scanId, findingInputs);
    await updateJobProgress(job.id, 90);

    const riskScore = calculateRiskScore(
      findingInputs.map((f) => ({ ruleId: f.ruleId, severity: f.severity as 'critical' | 'high' | 'medium' | 'low' | 'info' })),
    );

    await completeScan(scanId, {
      riskScore,
      pagesCrawled: crawlResult.pages.length,
      productsAnalyzed: crawlResult.products.length,
      rulesVersion: RULES_VERSION,
      totalFindings: findingInputs.length,
    });

    if (scan.visitorEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      try {
        const emailResult = await sendScanCompletedEmail({
          to: scan.visitorEmail,
          scanId,
          siteUrl: url,
          riskScore,
          findingsCount: findingInputs.length,
          pagesCrawled: crawlResult.pages.length,
          appUrl,
          locale: scan.visitorLocale === 'fr' ? 'fr' : 'en',
        });

        if (emailResult.sent) {
          logger.info('Scan completed email sent', {
            scanId,
            messageId: emailResult.messageId,
          });
        }
      } catch (emailError) {
        logger.warn('Email send failed', {
          error: emailError instanceof Error ? emailError.message : 'unknown',
        });
      }
    }

    await updateJobProgress(job.id, 100);
    await completeJob(job.id);
    logger.info('FREE_SITE_SCAN completed', {
      scanId,
      riskScore,
      findings: findingInputs.length,
      pages: crawlResult.pages.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('FREE_SITE_SCAN failed', { scanId, error: message });
    await failScan(scanId, message);
    await failJob(job.id, message);
  }
}
