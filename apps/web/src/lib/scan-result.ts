import { getScanFindings, getScanWithSite, getScanJobByScanId } from '@shopping-rescue/database';
import { checkWorkerHealth } from '@/lib/worker-health';
import {
  getPlanLimits,
  sortBySeverity,
  formatEvidenceLines,
  getRemediationSteps,
  buildRemediationChecklist,
  type RemediationChecklistItem,
} from '@shopping-rescue/shared';
import {
  getDisclaimer,
  getConfidenceLabelLocalized,
  localizeFindingText,
  type AppLocale,
} from '@/lib/locale';

export interface ScanFindingView {
  id: string;
  title: string;
  severity: string;
  category: string;
  confidence: number;
  affectedUrl?: string | null;
  explanation: string;
  recommendation: string;
  ruleId?: string;
  evidenceLines?: string[];
  remediationSteps?: string[];
}

export interface ScanResultData {
  scanId: string;
  status: string;
  url: string;
  platform: string;
  riskScore: number | null;
  riskLevel: string | null;
  confidenceLevel: string | null;
  pagesCrawled: number | null;
  productsAnalyzed: number | null;
  severityCounts: Record<string, number>;
  findings: ScanFindingView[];
  checklist: RemediationChecklistItem[];
  lockedFindingsCount: number;
  isReportUnlocked: boolean;
  disclaimer: string;
  completedAt: Date | null;
  workerOnline: boolean;
  jobStatus: string | null;
  jobProgress: number | null;
  visitorLocale: AppLocale;
}

export async function getScanResult(
  scanId: string,
  localeOverride?: AppLocale,
): Promise<ScanResultData | null> {
  const row = await getScanWithSite(scanId);
  if (!row) return null;

  const { scan, site } = row;
  const locale: AppLocale =
    localeOverride ?? (scan.visitorLocale === 'fr' ? 'fr' : 'en');
  const limits = getPlanLimits('free');
  const allFindings = await getScanFindings(scanId);
  const orderedFindings = scan.isReportUnlocked ? sortBySeverity(allFindings) : allFindings;

  const severityCounts = allFindings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const visibleCount = scan.isReportUnlocked
    ? orderedFindings.length
    : Math.min(limits.visibleFindings, orderedFindings.length);

  const visibleFindings: ScanFindingView[] = orderedFindings.slice(0, visibleCount).map((f) => {
    const localized = localizeFindingText(
      {
        ruleId: f.ruleId,
        title: f.title,
        category: f.category,
        explanation: f.explanation,
        recommendation: f.recommendation,
      },
      locale,
    );

    const base: ScanFindingView = {
      id: f.id,
      title: localized.title,
      severity: f.severity,
      category: localized.category,
      confidence: Number(f.confidence),
      affectedUrl: f.affectedUrl,
      explanation: localized.explanation,
      recommendation: localized.recommendation,
    };

    if (scan.isReportUnlocked) {
      return {
        ...base,
        ruleId: f.ruleId,
        evidenceLines: formatEvidenceLines((f.evidence ?? {}) as Record<string, unknown>),
        remediationSteps: getRemediationSteps(f.ruleId, localized.recommendation, locale),
      };
    }

    return base;
  });

  const checklist = scan.isReportUnlocked
    ? buildRemediationChecklist(
        orderedFindings.map((f) => {
          const localized = localizeFindingText(
            {
              ruleId: f.ruleId,
              title: f.title,
              category: f.category,
              explanation: f.explanation,
              recommendation: f.recommendation,
            },
            locale,
          );
          return {
            id: f.id,
            ruleId: f.ruleId,
            title: localized.title,
            severity: f.severity,
            recommendation: localized.recommendation,
          };
        }),
        locale,
      )
    : [];

  const lockedCount = Math.max(0, allFindings.length - visibleCount);

  const [job, workerHealth] = await Promise.all([
    getScanJobByScanId(scanId),
    scan.status === 'completed' || scan.status === 'failed'
      ? Promise.resolve({ online: true })
      : checkWorkerHealth(),
  ]);

  return {
    scanId: scan.id,
    status: scan.status,
    url: site.normalizedUrl,
    platform: site.platform ?? 'unknown',
    riskScore: scan.riskScore,
    riskLevel: scan.riskLevel,
    confidenceLevel: getConfidenceLabelLocalized(scan.confidenceLevel, locale),
    pagesCrawled: scan.pagesCrawled,
    productsAnalyzed: scan.productsAnalyzed,
    severityCounts,
    findings: visibleFindings,
    checklist,
    lockedFindingsCount: lockedCount,
    isReportUnlocked: scan.isReportUnlocked,
    disclaimer: getDisclaimer(locale),
    completedAt: scan.completedAt,
    workerOnline: workerHealth.online,
    jobStatus: job?.status ?? null,
    jobProgress: job?.progress ?? null,
    visitorLocale: locale,
  };
}
