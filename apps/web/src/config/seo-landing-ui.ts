import type { AppLocale } from '@/lib/locale';

export interface SeoLandingUiStrings {
  startFreeScan: string;
  viewPricing: string;
  whyMerchantsLandHere: string;
  whatIssueMeans: string;
  commonCauses: string;
  commonCausesSub: string;
  whatWeCheck: string;
  whatWeCheckSub: string;
  faq: string;
  relatedIssues: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  ctaTitle: string;
  ctaSub: string;
  fullAuditCta: string;
  rightsReserved: string;
  terms: string;
  privacy: string;
  disclaimer: string;
  languageLabel: string;
  switchToEnglish: string;
  switchToFrench: string;
}

export const SEO_LANDING_UI: Record<AppLocale, SeoLandingUiStrings> = {
  en: {
    startFreeScan: 'Start free scan',
    viewPricing: 'View pricing',
    whyMerchantsLandHere: 'Why merchants land here',
    whatIssueMeans: 'What this issue means',
    commonCauses: 'Common causes',
    commonCausesSub:
      'Patterns we see before Merchant Center accounts recover or products get re-approved.',
    whatWeCheck: 'What Shopping Rescue checks',
    whatWeCheckSub: 'Automated crawl and rules engine — no Google passwords required.',
    faq: 'FAQ',
    relatedIssues: 'Related issues',
    disclaimerTitle: 'Important disclaimer',
    disclaimerBody:
      'Shopping Rescue is an independent service and is not affiliated with, endorsed by, or sponsored by Google. Results are diagnostic recommendations and do not guarantee account reinstatement.',
    ctaTitle: 'Run a free scan on your storefront',
    ctaSub:
      'Get a risk score and sample findings in minutes. Upgrade to the full audit when you need every issue, evidence URL, and PDF report.',
    fullAuditCta: 'Full audit — €79',
    rightsReserved: 'All rights reserved.',
    terms: 'Terms',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    languageLabel: 'Language',
    switchToEnglish: 'English',
    switchToFrench: 'Français',
  },
  fr: {
    startFreeScan: 'Lancer un scan gratuit',
    viewPricing: 'Voir les tarifs',
    whyMerchantsLandHere: 'Pourquoi les marchands arrivent ici',
    whatIssueMeans: 'Ce que signifie ce problème',
    commonCauses: 'Causes fréquentes',
    commonCausesSub:
      'Schémas observés avant la récupération d’un compte Merchant Center ou la réapprobation des produits.',
    whatWeCheck: 'Ce que Shopping Rescue vérifie',
    whatWeCheckSub:
      'Crawl automatisé et moteur de règles — aucun mot de passe Google requis.',
    faq: 'Questions fréquentes',
    relatedIssues: 'Problèmes associés',
    disclaimerTitle: 'Avertissement important',
    disclaimerBody:
      'Shopping Rescue est un service indépendant, non affilié, approuvé ou sponsorisé par Google. Les résultats sont des recommandations diagnostiques et ne garantissent pas le rétablissement du compte.',
    ctaTitle: 'Lancez un scan gratuit sur votre boutique',
    ctaSub:
      'Obtenez un score de risque et des constats en quelques minutes. Passez à l’audit complet pour toutes les anomalies, URLs de preuve et rapport PDF.',
    fullAuditCta: 'Audit complet — 79 €',
    rightsReserved: 'Tous droits réservés.',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    disclaimer: 'Avertissement',
    languageLabel: 'Langue',
    switchToEnglish: 'English',
    switchToFrench: 'Français',
  },
};
