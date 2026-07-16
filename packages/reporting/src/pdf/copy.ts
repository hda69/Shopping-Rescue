import type { AppLocale } from '@shopping-rescue/shared/i18n';
import type { Severity } from './types';
import { countBySeverity } from './utils/severity';
import type { AuditReportData } from './types';

export interface PdfCopy {
  confidentialAudit: string;
  confidentialReport: string;
  coverTitle: string;
  riskScore: string;
  riskSuffix: (level: string) => string;
  issuesFound: string;
  prioritizedFindings: string;
  coverage: string;
  productsAnalyzed: (count: number) => string;
  executiveSummary: string;
  executiveSubtitle: string;
  issues: string;
  totalFindings: string;
  pages: string;
  crawled: string;
  products: string;
  analyzed: string;
  scanDetails: string;
  siteUrl: string;
  platform: string;
  confidence: string;
  completed: string;
  reportGenerated: string;
  severityDistribution: string;
  riskNarrative: string;
  remediationChecklist: string;
  checklistIntroFirst: string;
  checklistIntroContinue: string;
  issuesRange: (start: number, end: number) => string;
  findings: string;
  noIssuesDetected: string;
  passedAllChecks: string;
  findingLabel: (number: number, ruleId: string) => string;
  confidencePercent: (value: number) => string;
  affectedUrl: string;
  siteWide: string;
  whatWeFound: string;
  recommendedAction: string;
  implementationSteps: string;
  technicalEvidence: string;
  noEvidence: string;
  detailKey: (index: number) => string;
  severityLabels: Record<Severity, string>;
  buildNarrative: (audit: AuditReportData) => string;
  dateLocale: string;
}

const SEVERITY_EN: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

const SEVERITY_FR: Record<Severity, string> = {
  critical: 'Critique',
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
  info: 'Info',
};

const COPY_EN: PdfCopy = {
  confidentialAudit: 'Confidential audit',
  confidentialReport: 'Confidential audit report',
  coverTitle: 'Merchant Center diagnostic report',
  riskScore: 'Risk score',
  riskSuffix: (level) => `${level.toUpperCase()} risk`,
  issuesFound: 'Issues found',
  prioritizedFindings: 'Prioritized findings',
  coverage: 'Coverage',
  productsAnalyzed: (count) => `${count} products analyzed`,
  executiveSummary: 'Executive summary',
  executiveSubtitle:
    'Automated analysis of public storefront pages against Google Merchant Center trust and policy signals.',
  issues: 'Issues',
  totalFindings: 'Total findings',
  pages: 'Pages',
  crawled: 'Crawled',
  products: 'Products',
  analyzed: 'Analyzed',
  scanDetails: 'Scan details',
  siteUrl: 'Site URL',
  platform: 'Platform',
  confidence: 'Confidence',
  completed: 'Completed',
  reportGenerated: 'Report generated',
  severityDistribution: 'Severity distribution',
  riskNarrative: 'Risk narrative',
  remediationChecklist: 'Remediation checklist',
  checklistIntroFirst:
    'Fix these issues in order — highest severity first. Each card contains concrete actions required before running a new audit.',
  checklistIntroContinue: 'Continue through the prioritized remediation sequence below.',
  issuesRange: (start, end) =>
    end > start ? `Issues ${start}–${end}` : `Issues ${start}`,
  findings: 'Findings',
  noIssuesDetected: 'No issues were detected during this audit crawl.',
  passedAllChecks: 'Your storefront passed all automated checks.',
  findingLabel: (number, ruleId) =>
    `Finding ${String(number).padStart(2, '0')} · ${ruleId}`,
  confidencePercent: (value) => `${Math.round(value * 100)}% confidence`,
  affectedUrl: 'Affected URL',
  siteWide: 'Site-wide',
  whatWeFound: 'What we found',
  recommendedAction: 'Recommended action',
  implementationSteps: 'Implementation steps',
  technicalEvidence: 'Technical evidence',
  noEvidence: 'No structured evidence captured for this finding.',
  detailKey: (index) => `Detail ${index + 1}`,
  severityLabels: SEVERITY_EN,
  buildNarrative: (audit) => {
    const counts = countBySeverity(audit.findings);
    const critical = counts.critical + counts.high;
    if (audit.findings.length === 0) {
      return 'No material compliance issues were detected during this crawl. Continue monitoring Merchant Center notifications and re-run an audit after major storefront changes.';
    }
    if (critical > 0) {
      return `This audit detected ${audit.findings.length} issue(s), including ${counts.critical} critical and ${counts.high} high-severity items that may affect Merchant Center trust signals. Address critical findings first, then re-submit products or request a review once fixes are live.`;
    }
    return `This audit detected ${audit.findings.length} issue(s) across your storefront. Most are medium or lower severity, but resolving them improves consistency between your site and Merchant Center data.`;
  },
  dateLocale: 'en-GB',
};

const COPY_FR: PdfCopy = {
  confidentialAudit: 'Audit confidentiel',
  confidentialReport: 'Rapport d\'audit confidentiel',
  coverTitle: 'Rapport de diagnostic Merchant Center',
  riskScore: 'Score de risque',
  riskSuffix: (level) => `Risque ${SEVERITY_FR[normalizePdfSeverity(level)] ?? level}`,
  issuesFound: 'Problèmes détectés',
  prioritizedFindings: 'Constats priorisés',
  coverage: 'Couverture',
  productsAnalyzed: (count) => `${count} produits analysés`,
  executiveSummary: 'Synthèse exécutive',
  executiveSubtitle:
    'Analyse automatisée des pages publiques de la boutique selon les signaux de confiance et de conformité Google Merchant Center.',
  issues: 'Problèmes',
  totalFindings: 'Constats au total',
  pages: 'Pages',
  crawled: 'Explorées',
  products: 'Produits',
  analyzed: 'Analysés',
  scanDetails: 'Détails du scan',
  siteUrl: 'URL du site',
  platform: 'Plateforme',
  confidence: 'Confiance',
  completed: 'Terminé le',
  reportGenerated: 'Rapport généré le',
  severityDistribution: 'Répartition par gravité',
  riskNarrative: 'Analyse du risque',
  remediationChecklist: 'Checklist de correction',
  checklistIntroFirst:
    'Corrigez ces problèmes dans l\'ordre — gravité la plus élevée en premier. Chaque fiche contient les actions concrètes à mener avant un nouvel audit.',
  checklistIntroContinue: 'Poursuivez la séquence de correction priorisée ci-dessous.',
  issuesRange: (start, end) =>
    end > start ? `Problèmes ${start}–${end}` : `Problème ${start}`,
  findings: 'Constats',
  noIssuesDetected: 'Aucun problème n\'a été détecté lors de cet audit.',
  passedAllChecks: 'Votre boutique a passé toutes les vérifications automatisées.',
  findingLabel: (number, ruleId) =>
    `Constat ${String(number).padStart(2, '0')} · ${ruleId}`,
  confidencePercent: (value) => `${Math.round(value * 100)} % de confiance`,
  affectedUrl: 'URL concernée',
  siteWide: 'Site entier',
  whatWeFound: 'Ce que nous avons constaté',
  recommendedAction: 'Action recommandée',
  implementationSteps: 'Étapes de mise en œuvre',
  technicalEvidence: 'Preuves techniques',
  noEvidence: 'Aucune preuve structurée n\'a été capturée pour ce constat.',
  detailKey: (index) => `Détail ${index + 1}`,
  severityLabels: SEVERITY_FR,
  buildNarrative: (audit) => {
    const counts = countBySeverity(audit.findings);
    const critical = counts.critical + counts.high;
    if (audit.findings.length === 0) {
      return 'Aucun problème de conformité significatif n\'a été détecté lors de cet audit. Continuez à surveiller les notifications Merchant Center et relancez un audit après des changements majeurs sur la boutique.';
    }
    if (critical > 0) {
      return `Cet audit a détecté ${audit.findings.length} problème(s), dont ${counts.critical} critique(s) et ${counts.high} de gravité élevée pouvant affecter les signaux de confiance Merchant Center. Traitez d\'abord les constats critiques, puis resoumettez les produits ou demandez un examen une fois les corrections en ligne.`;
    }
    return `Cet audit a détecté ${audit.findings.length} problème(s) sur votre boutique. La plupart sont de gravité moyenne ou inférieure, mais les corriger améliore la cohérence entre votre site et les données Merchant Center.`;
  },
  dateLocale: 'fr-FR',
};

function normalizePdfSeverity(value: string): Severity {
  const key = value.toLowerCase();
  if (key === 'critical' || key === 'high' || key === 'medium' || key === 'low' || key === 'info') {
    return key;
  }
  return 'info';
}

export function getPdfCopy(locale: AppLocale = 'en'): PdfCopy {
  return locale === 'fr' ? COPY_FR : COPY_EN;
}
