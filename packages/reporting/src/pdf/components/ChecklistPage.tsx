import type { AuditFinding } from '../types';
import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { getPdfCopy } from '../copy';
import { ReportFooter } from './ReportFooter';
import { ReportHeader } from './ReportHeader';
import { SeverityBadge } from './SeverityBadge';

interface ChecklistPageProps {
  findings: AuditFinding[];
  rangeLabel: string;
  intro: string;
  pageNumber: number;
  totalPages: number;
  locale?: AppLocale;
}

export function ChecklistPage({
  findings,
  rangeLabel,
  intro,
  pageNumber,
  totalPages,
  locale = 'en',
}: ChecklistPageProps) {
  const copy = getPdfCopy(locale);

  return (
    <section className="report-page">
      <ReportHeader locale={locale} />
      <h2 className="page-title">{copy.remediationChecklist}</h2>
      <p className="page-subtitle">{intro}</p>
      <div className="section-label">{rangeLabel}</div>

      {findings.map((finding) => (
        <article key={finding.id} className="checklist-card avoid-page-break">
          <div className={`checklist-card__accent checklist-card__accent--${finding.severity}`} />
          <div className="checklist-card__body">
            <div className="checklist-card__head">
              <span className="checklist-card__number">
                {String(finding.number).padStart(2, '0')}
              </span>
              <SeverityBadge severity={finding.severity} locale={locale} />
              <span className="checklist-card__meta">{finding.ruleId}</span>
            </div>
            <h3 className="checklist-card__title">{finding.title}</h3>
            <ol className="checklist-card__steps">
              {finding.steps.slice(0, 4).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </article>
      ))}

      <ReportFooter pageNumber={pageNumber} totalPages={totalPages} locale={locale} />
    </section>
  );
}
