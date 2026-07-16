import type { AppLocale } from '@shopping-rescue/shared/i18n';
import type { DetailedFinding, DetailedScanReport } from '../detailed-report';
import type { AuditFinding, AuditReportData, Severity } from './types';
import { getPdfCopy } from './copy';
import { normalizeSeverity } from './utils/severity';

function evidenceFromLines(
  lines: string[],
  locale: AppLocale,
): Record<string, string> {
  const copy = getPdfCopy(locale);
  const out: Record<string, string> = {};
  lines.forEach((line, index) => {
    const colon = line.indexOf(':');
    if (colon > 0) {
      out[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    } else {
      out[copy.detailKey(index)] = line;
    }
  });
  return out;
}

function mapFinding(finding: DetailedFinding, number: number, locale: AppLocale): AuditFinding {
  return {
    id: finding.id,
    number,
    severity: normalizeSeverity(finding.severity),
    category: finding.category,
    ruleId: finding.ruleId,
    confidence: finding.confidence,
    title: finding.title,
    affectedUrl: finding.affectedUrl ?? '',
    whatWeFound: finding.explanation,
    whatToDo: finding.recommendation,
    evidence: evidenceFromLines(finding.evidenceLines, locale),
    steps: finding.remediationSteps,
  };
}

export function mapDetailedScanReportToAuditData(report: DetailedScanReport): AuditReportData {
  const locale = report.locale ?? 'en';
  const findings = report.findings.map((finding, index) =>
    mapFinding(finding, index + 1, locale),
  );

  return {
    auditId: report.scanId,
    generatedAt: report.generatedAt,
    completedAt: report.completedAt ?? report.generatedAt,
    siteUrl: report.siteUrl,
    platform: report.platform,
    confidence: report.confidenceLevel ?? 'medium',
    riskScore: report.riskScore ?? 0,
    riskLevel: normalizeSeverity(report.riskLevel) as Severity,
    pagesCrawled: report.pagesCrawled ?? 0,
    productsAnalyzed: report.productsAnalyzed ?? 0,
    findings,
    disclaimer: report.disclaimer,
    locale,
  };
}
