import type { AuditFinding } from '../types';
import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { getPdfCopy } from '../copy';
import { EvidenceBlock } from './EvidenceBlock';
import { ReportFooter } from './ReportFooter';
import { ReportHeader } from './ReportHeader';
import { SeverityBadge } from './SeverityBadge';

interface FindingPageProps {
  finding: AuditFinding;
  pageNumber: number;
  totalPages: number;
  showDisclaimer?: boolean;
  disclaimer?: string;
  locale?: AppLocale;
}

export function FindingPage({
  finding,
  pageNumber,
  totalPages,
  showDisclaimer = false,
  disclaimer,
  locale = 'en',
}: FindingPageProps) {
  const copy = getPdfCopy(locale);
  const leftSteps = finding.steps.filter((_, index) => index % 2 === 0);
  const rightSteps = finding.steps.filter((_, index) => index % 2 === 1);

  return (
    <section className="report-page">
      <ReportHeader locale={locale} />

      <div className="finding-head avoid-page-break">
        <div className="section-label">{copy.findingLabel(finding.number, finding.ruleId)}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <SeverityBadge severity={finding.severity} locale={locale} />
          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{finding.category}</span>
          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
            {copy.confidencePercent(finding.confidence)}
          </span>
        </div>
        <h2 className="finding-head__title">{finding.title}</h2>
      </div>

      <div className="info-block avoid-page-break">
        <div className="info-block__label">{copy.affectedUrl}</div>
        <div className="info-block__url">{finding.affectedUrl || copy.siteWide}</div>
      </div>

      <div className="info-block avoid-page-break">
        <div className="info-block__label">{copy.whatWeFound}</div>
        <div className="info-block__text">{finding.whatWeFound}</div>
      </div>

      <div className="info-block avoid-page-break">
        <div className="info-block__label">{copy.recommendedAction}</div>
        <div className="info-block__text">{finding.whatToDo}</div>
      </div>

      <EvidenceBlock evidence={finding.evidence} locale={locale} />

      {finding.steps.length > 0 ? (
        <div className="info-block avoid-page-break">
          <div className="info-block__label">{copy.implementationSteps}</div>
          <div className="steps-grid">
            <ol>
              {leftSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ol start={leftSteps.length + 1}>
              {rightSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {showDisclaimer && disclaimer ? <div className="disclaimer">{disclaimer}</div> : null}

      <ReportFooter pageNumber={pageNumber} totalPages={totalPages} locale={locale} />
    </section>
  );
}
