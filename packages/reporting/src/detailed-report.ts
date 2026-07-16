import {
  calculateRiskScore,
  formatEvidenceLines,
  getRemediationSteps,
  sortBySeverity,
  buildRemediationChecklist,
  type Severity,
  type RemediationChecklistItem,
} from '@shopping-rescue/shared';
import {
  getDisclaimer,
  getConfidenceLabelLocalized,
  localizeFindingText,
  type AppLocale,
} from '@shopping-rescue/shared/i18n';

export type { RemediationChecklistItem };

export interface DetailedFindingInput {
  id: string;
  ruleId: string;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  affectedUrl?: string | null;
  evidence: Record<string, unknown>;
  explanation: string;
  recommendation: string;
}

export interface DetailedFinding {
  id: string;
  ruleId: string;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  affectedUrl?: string | null;
  explanation: string;
  recommendation: string;
  evidenceLines: string[];
  remediationSteps: string[];
}

export interface DetailedScanReport {
  scanId: string;
  siteUrl: string;
  platform: string;
  riskScore: number | null;
  riskLevel: string | null;
  confidenceLevel: string | null;
  pagesCrawled: number | null;
  productsAnalyzed: number | null;
  findingCount: number;
  findings: DetailedFinding[];
  checklist: RemediationChecklistItem[];
  disclaimer: string;
  generatedAt: string;
  completedAt: string | null;
  locale: AppLocale;
}

export function expandFinding(
  finding: DetailedFindingInput,
  locale: AppLocale = 'en',
): DetailedFinding {
  const localized = localizeFindingText(
    {
      ruleId: finding.ruleId,
      title: finding.title,
      category: finding.category,
      explanation: finding.explanation,
      recommendation: finding.recommendation,
    },
    locale,
  );

  return {
    id: finding.id,
    ruleId: finding.ruleId,
    title: localized.title,
    category: localized.category,
    severity: finding.severity,
    confidence: finding.confidence,
    affectedUrl: finding.affectedUrl,
    explanation: localized.explanation,
    recommendation: localized.recommendation,
    evidenceLines: formatEvidenceLines(finding.evidence ?? {}),
    remediationSteps: getRemediationSteps(
      finding.ruleId,
      localized.recommendation,
      locale,
    ),
  };
}

export interface BuildDetailedReportInput {
  scanId: string;
  siteUrl: string;
  platform: string;
  riskScore: number | null;
  riskLevel: string | null;
  confidenceLevel: string | null;
  pagesCrawled: number | null;
  productsAnalyzed: number | null;
  findings: DetailedFindingInput[];
  completedAt: Date | null;
  generatedAt?: Date;
  locale?: AppLocale;
}

export function buildDetailedScanReport(input: BuildDetailedReportInput): DetailedScanReport {
  const locale = input.locale ?? 'en';
  const sorted = sortBySeverity(input.findings);
  const expanded = sorted.map((finding) => expandFinding(finding, locale));
  const score =
    input.riskScore ??
    calculateRiskScore(
      sorted.map((finding) => ({
        ruleId: finding.ruleId,
        severity: finding.severity as Severity,
      })),
    );

  const localizedForChecklist = sorted.map((finding) => {
    const localized = localizeFindingText(
      {
        ruleId: finding.ruleId,
        title: finding.title,
        category: finding.category,
        explanation: finding.explanation,
        recommendation: finding.recommendation,
      },
      locale,
    );
    return {
      id: finding.id,
      ruleId: finding.ruleId,
      title: localized.title,
      severity: finding.severity,
      recommendation: localized.recommendation,
    };
  });

  return {
    scanId: input.scanId,
    siteUrl: input.siteUrl,
    platform: input.platform,
    riskScore: score,
    riskLevel: input.riskLevel,
    confidenceLevel: getConfidenceLabelLocalized(input.confidenceLevel, locale),
    pagesCrawled: input.pagesCrawled,
    productsAnalyzed: input.productsAnalyzed,
    findingCount: expanded.length,
    findings: expanded,
    checklist: buildRemediationChecklist(localizedForChecklist, locale),
    disclaimer: getDisclaimer(locale),
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    completedAt: input.completedAt?.toISOString() ?? null,
    locale,
  };
}
