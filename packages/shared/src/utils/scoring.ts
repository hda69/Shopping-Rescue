import { SEVERITY_WEIGHTS, MAX_SCORE_PER_RULE } from '../config/index';
import type { Severity } from '../types/index';

interface ScoringFinding {
  ruleId: string;
  severity: Severity;
  count?: number;
}

export function calculateRiskScore(findings: ScoringFinding[]): number {
  const ruleScores = new Map<string, number>();

  for (const finding of findings) {
    const weight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
    const count = finding.count ?? 1;
    const current = ruleScores.get(finding.ruleId) ?? 0;
    ruleScores.set(finding.ruleId, current + weight * count);
  }

  let total = 0;
  for (const score of ruleScores.values()) {
    total += Math.min(score, MAX_SCORE_PER_RULE);
  }

  return Math.min(100, total);
}

export function calculateConfidenceLevel(
  findingsCount: number,
  pagesCrawled: number,
  hasMerchantData: boolean,
): 'low' | 'medium' | 'high' {
  let score = 0;
  if (pagesCrawled >= 10) score += 1;
  if (pagesCrawled >= 50) score += 1;
  if (findingsCount > 0) score += 1;
  if (hasMerchantData) score += 2;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}
