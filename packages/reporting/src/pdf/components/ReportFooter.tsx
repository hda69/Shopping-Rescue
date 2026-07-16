import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { getPdfCopy } from '../copy';

interface ReportFooterProps {
  pageNumber: number;
  totalPages: number;
  dark?: boolean;
  locale?: AppLocale;
}

export function ReportFooter({
  pageNumber,
  totalPages,
  locale = 'en',
}: ReportFooterProps) {
  const copy = getPdfCopy(locale);

  return (
    <footer className="report-footer">
      <span className="report-footer__label">Shopping Rescue · {copy.confidentialReport}</span>
      <span>
        {pageNumber} / {totalPages}
      </span>
    </footer>
  );
}
