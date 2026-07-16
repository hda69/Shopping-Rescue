import type { AppLocale } from './locale';
import { RULES_FR } from './rules-fr';
import { getCategoryLabel } from './labels';

export interface LocalizableFinding {
  ruleId: string;
  title: string;
  category: string;
  explanation: string;
  recommendation: string;
}

export function localizeFindingText<T extends LocalizableFinding>(
  finding: T,
  locale: AppLocale,
): T {
  if (locale === 'en') {
    return {
      ...finding,
      category: getCategoryLabel(finding.category, locale),
    };
  }

  const rule = RULES_FR[finding.ruleId];
  return {
    ...finding,
    title: rule?.title ?? finding.title,
    category: getCategoryLabel(finding.category, locale),
    explanation: rule?.description ?? finding.explanation,
    recommendation: rule?.remediationTemplate ?? finding.recommendation,
  };
}
