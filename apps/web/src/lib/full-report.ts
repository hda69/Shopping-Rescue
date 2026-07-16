import { getScanFindings, getScanWithSite } from '@shopping-rescue/database';
import { buildDetailedScanReport } from '@shopping-rescue/reporting';
import type { AppLocale } from '@shopping-rescue/shared/i18n';

export async function loadDetailedScanReport(scanId: string) {
  const row = await getScanWithSite(scanId);
  if (!row || !row.scan.isReportUnlocked || row.scan.status !== 'completed') {
    return null;
  }

  const { scan, site } = row;
  const locale: AppLocale = scan.visitorLocale === 'fr' ? 'fr' : 'en';
  const allFindings = await getScanFindings(scanId);

  return buildDetailedScanReport({
    scanId,
    siteUrl: site.normalizedUrl,
    platform: site.platform ?? 'unknown',
    riskScore: scan.riskScore,
    riskLevel: scan.riskLevel,
    confidenceLevel: scan.confidenceLevel,
    pagesCrawled: scan.pagesCrawled,
    productsAnalyzed: scan.productsAnalyzed,
    completedAt: scan.completedAt,
    locale,
    findings: allFindings.map((finding) => ({
      id: finding.id,
      ruleId: finding.ruleId,
      title: finding.title,
      category: finding.category,
      severity: finding.severity,
      confidence: Number(finding.confidence),
      affectedUrl: finding.affectedUrl,
      evidence: (finding.evidence ?? {}) as Record<string, unknown>,
      explanation: finding.explanation,
      recommendation: finding.recommendation,
    })),
  });
}
