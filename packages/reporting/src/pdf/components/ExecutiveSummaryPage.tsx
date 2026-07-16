import type { AuditReportData } from '../types';
import { getPdfCopy } from '../copy';
import { SEVERITY_ORDER, countBySeverity } from '../utils/severity';
import { MetricCard } from './MetricCard';
import { ReportFooter } from './ReportFooter';
import { ReportHeader } from './ReportHeader';
import { SeverityBadge } from './SeverityBadge';

interface ExecutiveSummaryPageProps {
  audit: AuditReportData;
  pageNumber: number;
  totalPages: number;
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ExecutiveSummaryPage({ audit, pageNumber, totalPages }: ExecutiveSummaryPageProps) {
  const copy = getPdfCopy(audit.locale);
  const counts = countBySeverity(audit.findings);
  const maxCount = Math.max(...SEVERITY_ORDER.map((s) => counts[s]), 1);

  return (
    <section className="report-page">
      <ReportHeader locale={audit.locale} />
      <h2 className="page-title">{copy.executiveSummary}</h2>
      <p className="page-subtitle">{copy.executiveSubtitle}</p>

      <div className="summary-grid">
        <MetricCard label={copy.riskScore} value={String(audit.riskScore)} sub={audit.riskLevel} />
        <MetricCard label={copy.issues} value={String(audit.findings.length)} sub={copy.totalFindings} />
        <MetricCard label={copy.pages} value={String(audit.pagesCrawled)} sub={copy.crawled} />
        <MetricCard
          label={copy.products}
          value={String(audit.productsAnalyzed)}
          sub={copy.analyzed}
        />
      </div>

      <div className="summary-details">
        <div className="detail-card avoid-page-break">
          <div className="section-label">{copy.scanDetails}</div>
          <div className="detail-card__row">
            <span className="detail-card__key">{copy.siteUrl}</span>
            <span className="detail-card__value">{audit.siteUrl}</span>
          </div>
          <div className="detail-card__row">
            <span className="detail-card__key">{copy.platform}</span>
            <span className="detail-card__value">{audit.platform}</span>
          </div>
          <div className="detail-card__row">
            <span className="detail-card__key">{copy.confidence}</span>
            <span className="detail-card__value">{audit.confidence}</span>
          </div>
          <div className="detail-card__row">
            <span className="detail-card__key">{copy.completed}</span>
            <span className="detail-card__value">{formatDate(audit.completedAt, copy.dateLocale)}</span>
          </div>
          <div className="detail-card__row">
            <span className="detail-card__key">{copy.reportGenerated}</span>
            <span className="detail-card__value">{formatDate(audit.generatedAt, copy.dateLocale)}</span>
          </div>
        </div>

        <div className="detail-card avoid-page-break">
          <div className="section-label">{copy.severityDistribution}</div>
          <div className="severity-bars">
            {SEVERITY_ORDER.map((severity) => (
              <div key={severity} className="severity-bar">
                <SeverityBadge severity={severity} locale={audit.locale} />
                <div className="severity-bar__track">
                  <div
                    className={`severity-bar__fill severity-bar__fill--${severity}`}
                    style={{ width: `${(counts[severity] / maxCount) * 100}%` }}
                  />
                </div>
                <span>{counts[severity]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-label">{copy.riskNarrative}</div>
      <div className="narrative avoid-page-break">{copy.buildNarrative(audit)}</div>

      <ReportFooter pageNumber={pageNumber} totalPages={totalPages} locale={audit.locale} />
    </section>
  );
}
