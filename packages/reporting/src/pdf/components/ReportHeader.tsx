import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { getPdfCopy } from '../copy';

interface ReportHeaderProps {
  dark?: boolean;
  locale?: AppLocale;
}

export function ReportHeader({ dark = false, locale = 'en' }: ReportHeaderProps) {
  const copy = getPdfCopy(locale);

  return (
    <header className="report-header" style={dark ? { color: 'rgba(255,255,255,0.45)' } : undefined}>
      <span className="report-header__brand">Shopping Rescue</span>
      <span>{copy.confidentialReport}</span>
    </header>
  );
}
