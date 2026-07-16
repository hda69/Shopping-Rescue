export type RuleCategory =
  | 'business_identity'
  | 'shipping'
  | 'returns_refunds'
  | 'products'
  | 'site_quality'
  | 'trust_representation'
  | 'merchant_consistency';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ConfidenceMethod = 'deterministic' | 'heuristic' | 'ai-assisted';

export type FindingStatus = 'open' | 'acknowledged' | 'fixed' | 'ignored';

export type PlanType = 'free' | 'full_audit' | 'monitoring_pro' | 'agency';

export type ScanType = 'free' | 'full' | 'monitoring';

export type JobType =
  | 'FREE_SITE_SCAN'
  | 'FULL_SITE_SCAN'
  | 'MERCHANT_SYNC'
  | 'WEEKLY_MONITORING_SCAN'
  | 'GENERATE_REPORT'
  | 'GENERATE_PDF'
  | 'SEND_SCAN_COMPLETED_EMAIL'
  | 'SEND_RISK_ALERT'
  | 'DELETE_EXPIRED_DATA'
  | 'RETRY_FAILED_INTEGRATION';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface RuleDefinition {
  id: string;
  version: number;
  category: RuleCategory;
  title: string;
  description: string;
  severity: Severity;
  confidenceMethod: ConfidenceMethod;
  evidenceRequirements: string[];
  remediationTemplate: string;
  policyReference?: string;
  enabled: boolean;
}

export interface Finding {
  id: string;
  scanId: string;
  ruleId: string;
  ruleVersion: number;
  title: string;
  category: string;
  severity: Severity;
  confidence: number;
  affectedUrl?: string;
  evidence: Record<string, unknown>;
  explanation: string;
  recommendation: string;
  status: FindingStatus;
  isAiAssisted?: boolean;
  createdAt: Date;
}

export interface PlanLimits {
  maxPages: number;
  maxProducts: number;
  visibleFindings: number;
  maxSites: number;
  scanIntervalDays: number;
  manualRescanPerDay: number;
  retentionDays: number;
}

export interface ScanJobPayload {
  siteId: string;
  scanId?: string;
  scanType: ScanType;
  url: string;
  organizationId?: string;
}

export const DISCLAIMER =
  'Shopping Rescue is an independent service and is not affiliated with, endorsed by, or sponsored by Google. Results are diagnostic recommendations and do not guarantee account reinstatement.';
