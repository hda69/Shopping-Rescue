import { calculateRiskScore, DISCLAIMER, type Finding } from '@shopping-rescue/shared';

export interface ReportInput {
  scanId: string;
  siteUrl: string;
  findings: Finding[];
  generatedAt?: Date;
}

export interface ScanReport {
  scanId: string;
  siteUrl: string;
  riskScore: number;
  findingCount: number;
  findings: Finding[];
  disclaimer: string;
  generatedAt: string;
}

export function buildScanReport(input: ReportInput): ScanReport {
  const generatedAt = (input.generatedAt ?? new Date()).toISOString();
  const riskScore = calculateRiskScore(
    input.findings.map((finding) => ({
      ruleId: finding.ruleId,
      severity: finding.severity,
    })),
  );

  return {
    scanId: input.scanId,
    siteUrl: input.siteUrl,
    riskScore,
    findingCount: input.findings.length,
    findings: input.findings,
    disclaimer: DISCLAIMER,
    generatedAt,
  };
}
