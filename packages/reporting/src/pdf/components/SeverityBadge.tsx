import type { AppLocale } from '@shopping-rescue/shared/i18n';
import type { Severity } from '../types';
import { getPdfCopy } from '../copy';

interface SeverityBadgeProps {
  severity: Severity;
  locale?: AppLocale;
}

export function SeverityBadge({ severity, locale = 'en' }: SeverityBadgeProps) {
  const labels = getPdfCopy(locale).severityLabels;

  return (
    <span className={`severity-badge severity-badge--${severity}`}>{labels[severity]}</span>
  );
}
