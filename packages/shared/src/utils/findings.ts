import type { Severity } from '../types/index';

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function compareSeverity(a: Severity, b: Severity): number {
  return (SEVERITY_ORDER[a] ?? 99) - (SEVERITY_ORDER[b] ?? 99);
}

export function sortBySeverity<T extends { severity: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      compareSeverity(a.severity as Severity, b.severity as Severity) ||
      a.severity.localeCompare(b.severity),
  );
}

export function formatEvidenceLines(evidence: Record<string, unknown>): string[] {
  return Object.entries(evidence).map(([key, value]) => {
    if (value === null || value === undefined) return `${key}: —`;
    if (typeof value === 'object') return `${key}: ${JSON.stringify(value)}`;
    return `${key}: ${String(value)}`;
  });
}
