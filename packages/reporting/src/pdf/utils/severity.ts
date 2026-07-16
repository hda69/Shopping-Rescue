import type { Severity } from '../types';

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export function normalizeSeverity(value: string | null | undefined): Severity {
  const key = (value ?? 'info').toLowerCase();
  if (key === 'critical' || key === 'high' || key === 'medium' || key === 'low' || key === 'info') {
    return key;
  }
  return 'info';
}

export function countBySeverity(findings: { severity: Severity }[]): Record<Severity, number> {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<Severity, number>,
  );
}
