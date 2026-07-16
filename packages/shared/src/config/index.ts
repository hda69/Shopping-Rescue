import type { PlanLimits, PlanType, RiskLevel } from '../types/index';
import type { AppLocale } from '../i18n/locale';
import { getRiskLabelLocalized } from '../i18n/labels';

export { CONTACT_EMAIL, DEFAULT_FROM_EMAIL } from './brand';

export const DEFAULT_PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxPages: 15,
    maxProducts: 20,
    visibleFindings: 2,
    maxSites: 1,
    scanIntervalDays: 0,
    manualRescanPerDay: 0,
    retentionDays: 30,
  },
  full_audit: {
    maxPages: 150,
    maxProducts: 500,
    visibleFindings: Infinity,
    maxSites: 1,
    scanIntervalDays: 0,
    manualRescanPerDay: 1,
    retentionDays: 365,
  },
  monitoring_pro: {
    maxPages: 150,
    maxProducts: 500,
    visibleFindings: Infinity,
    maxSites: 3,
    scanIntervalDays: 7,
    manualRescanPerDay: 2,
    retentionDays: 365,
  },
  agency: {
    maxPages: 150,
    maxProducts: 500,
    visibleFindings: Infinity,
    maxSites: 20,
    scanIntervalDays: 7,
    manualRescanPerDay: 5,
    retentionDays: 365,
  },
};

export const PLAN_PRICES_CENTS: Record<string, number> = {
  full_audit: 7900,
  monitoring_pro: 4900,
  agency: 19900,
};

export const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 20,
  high: 10,
  medium: 4,
  low: 1,
  info: 0,
};

export const MAX_SCORE_PER_RULE = 40;
export const MAX_RISK_SCORE = 100;

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 19) return 'low';
  if (score <= 39) return 'moderate';
  if (score <= 59) return 'elevated';
  if (score <= 79) return 'high';
  return 'critical';
}

export function getRiskLabel(level: RiskLevel, locale: AppLocale = 'en'): string {
  return getRiskLabelLocalized(level, locale);
}

export function getPlanLimits(plan: PlanType): PlanLimits {
  return DEFAULT_PLAN_LIMITS[plan];
}
