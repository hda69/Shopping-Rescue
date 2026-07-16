import type { AppLocale } from '@shopping-rescue/shared/i18n';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AuditFinding {
  id: string;
  number: number;
  severity: Severity;
  category: string;
  ruleId: string;
  confidence: number;
  title: string;
  affectedUrl: string;
  whatWeFound: string;
  whatToDo: string;
  evidence: Record<string, string | number | boolean>;
  steps: string[];
}

export interface AuditReportData {
  auditId: string;
  generatedAt: string;
  completedAt: string;
  siteUrl: string;
  platform: string;
  confidence: string;
  riskScore: number;
  riskLevel: Severity;
  pagesCrawled: number;
  productsAnalyzed: number;
  findings: AuditFinding[];
  disclaimer: string;
  locale: AppLocale;
}
