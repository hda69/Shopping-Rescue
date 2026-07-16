import type { AuditReportData } from '../types';
import { getPdfCopy } from '../copy';
import { REPORT_LOGO_SRC } from '../assets/logo-url';
import { MetricCard } from './MetricCard';
import { ReportFooter } from './ReportFooter';

interface CoverPageProps {
  audit: AuditReportData;
  pageNumber: number;
  totalPages: number;
}

export function CoverPage({ audit, pageNumber, totalPages }: CoverPageProps) {
  const copy = getPdfCopy(audit.locale);
  const issueCount = audit.findings.length;

  return (
    <section className="report-page report-page--cover">
      <div className="cover">
        <div className="cover__glow cover__glow--blue" />
        <div className="cover__glow cover__glow--purple" />
        <div className="cover__glow cover__glow--red" />

        <div className="cover__content">
          <div className="cover__brand">
            <img
              src={REPORT_LOGO_SRC}
              alt=""
              className="cover__logo"
              width={64}
              height={64}
              aria-hidden
            />
            <div className="cover__brand-text" aria-label="Shopping Rescue">
              <span className="cover__brand-shopping">Shopping </span>
              <span className="cover__brand-rescue">Rescue</span>
            </div>
          </div>
          <div className="cover__eyebrow">{copy.confidentialAudit}</div>
          <h1 className="cover__title">{copy.coverTitle}</h1>
          <div className="cover__url">{audit.siteUrl}</div>

          <div className="cover__metrics">
            <MetricCard
              dark
              label={copy.riskScore}
              value={String(audit.riskScore)}
              sub={copy.riskSuffix(audit.riskLevel)}
            />
            <MetricCard
              dark
              label={copy.issuesFound}
              value={String(issueCount)}
              sub={copy.prioritizedFindings}
            />
            <MetricCard
              dark
              label={copy.coverage}
              value={String(audit.pagesCrawled)}
              sub={copy.productsAnalyzed(audit.productsAnalyzed)}
            />
          </div>
        </div>

        <ReportFooter
          pageNumber={pageNumber}
          totalPages={totalPages}
          dark
          locale={audit.locale}
        />
      </div>
    </section>
  );
}
