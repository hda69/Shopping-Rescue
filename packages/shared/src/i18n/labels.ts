import type { ConfidenceLevel, RiskLevel } from '../types/index';
import type { AppLocale } from './locale';

const RISK_LABELS_EN: Record<RiskLevel, string> = {
  low: 'Low detected risk',
  moderate: 'Moderate',
  elevated: 'Elevated',
  high: 'High',
  critical: 'Critical',
};

const RISK_LABELS_FR: Record<RiskLevel, string> = {
  low: 'Risque faible détecté',
  moderate: 'Modéré',
  elevated: 'Élevé',
  high: 'Haut',
  critical: 'Critique',
};

const CONFIDENCE_LABELS_EN: Record<ConfidenceLevel, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

const CONFIDENCE_LABELS_FR: Record<ConfidenceLevel, string> = {
  low: 'faible',
  medium: 'moyenne',
  high: 'élevée',
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  business_identity: 'Business identity',
  shipping: 'Shipping',
  returns_refunds: 'Returns & refunds',
  products: 'Products',
  site_quality: 'Site quality',
  trust_representation: 'Trust & representation',
  merchant_consistency: 'Merchant consistency',
};

const CATEGORY_LABELS_FR: Record<string, string> = {
  business_identity: 'Identité commerciale',
  shipping: 'Livraison',
  returns_refunds: 'Retours et remboursements',
  products: 'Produits',
  site_quality: 'Qualité du site',
  trust_representation: 'Confiance et représentation',
  merchant_consistency: 'Cohérence Merchant Center',
};

export function getRiskLabelLocalized(level: RiskLevel, locale: AppLocale = 'en'): string {
  return locale === 'fr' ? RISK_LABELS_FR[level] : RISK_LABELS_EN[level];
}

export function getConfidenceLabelLocalized(
  level: string | null | undefined,
  locale: AppLocale = 'en',
): string {
  if (!level || !(level in CONFIDENCE_LABELS_EN)) return level ?? '';
  const key = level as ConfidenceLevel;
  return locale === 'fr' ? CONFIDENCE_LABELS_FR[key] : CONFIDENCE_LABELS_EN[key];
}

export function getCategoryLabel(category: string, locale: AppLocale = 'en'): string {
  if (locale === 'fr') return CATEGORY_LABELS_FR[category] ?? category;
  return CATEGORY_LABELS_EN[category] ?? category;
}

export const REMEDIATION_FALLBACK_EN = [
  'Verify the fix on your live storefront.',
  'Re-run a Shopping Rescue scan to confirm the issue is resolved.',
];

export const REMEDIATION_FALLBACK_FR = [
  'Vérifiez la correction sur votre boutique en ligne.',
  'Relancez un scan Shopping Rescue pour confirmer que le problème est résolu.',
];
