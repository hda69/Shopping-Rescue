import type { ReactNode } from 'react';
import type { AuditReportData } from './types';
import { getPdfCopy } from './copy';
import { chunkArray } from './utils/chunkArray';
import { calculateTotalPages } from './utils/pagination';
import { ChecklistPage } from './components/ChecklistPage';
import { CoverPage } from './components/CoverPage';
import { ExecutiveSummaryPage } from './components/ExecutiveSummaryPage';
import { FindingPage } from './components/FindingPage';
import { ReportFooter } from './components/ReportFooter';
import { ReportHeader } from './components/ReportHeader';

interface AuditReportProps {
  audit: AuditReportData;
}

export function AuditReport({ audit }: AuditReportProps) {
  const copy = getPdfCopy(audit.locale);
  const totalPages = calculateTotalPages(audit.findings.length);
  const checklistChunks = chunkArray(audit.findings, 3);
  let pageNumber = 1;

  const pages: ReactNode[] = [];

  pages.push(
    <CoverPage key="cover" audit={audit} pageNumber={pageNumber} totalPages={totalPages} />,
  );
  pageNumber += 1;

  pages.push(
    <ExecutiveSummaryPage
      key="summary"
      audit={audit}
      pageNumber={pageNumber}
      totalPages={totalPages}
    />,
  );
  pageNumber += 1;

  checklistChunks.forEach((chunk, chunkIndex) => {
    const start = chunkIndex * 3 + 1;
    const end = start + chunk.length - 1;
    const rangeLabel = copy.issuesRange(start, end);
    const intro = chunkIndex === 0 ? copy.checklistIntroFirst : copy.checklistIntroContinue;

    pages.push(
      <ChecklistPage
        key={`checklist-${chunkIndex}`}
        findings={chunk}
        rangeLabel={rangeLabel}
        intro={intro}
        pageNumber={pageNumber}
        totalPages={totalPages}
        locale={audit.locale}
      />,
    );
    pageNumber += 1;
  });

  if (audit.findings.length === 0) {
    pages.push(
      <section key="empty" className="report-page">
        <ReportHeader locale={audit.locale} />
        <h2 className="page-title">{copy.findings}</h2>
        <p className="page-subtitle">{copy.noIssuesDetected}</p>
        <div className="empty-state avoid-page-break">{copy.passedAllChecks}</div>
        <div className="disclaimer">{audit.disclaimer}</div>
        <ReportFooter pageNumber={pageNumber} totalPages={totalPages} locale={audit.locale} />
      </section>,
    );
    return <>{pages}</>;
  }

  audit.findings.forEach((finding, index) => {
    const isLast = index === audit.findings.length - 1;
    pages.push(
      <FindingPage
        key={finding.id}
        finding={finding}
        pageNumber={pageNumber}
        totalPages={totalPages}
        showDisclaimer={isLast}
        disclaimer={audit.disclaimer}
        locale={audit.locale}
      />,
    );
    pageNumber += 1;
  });

  return <>{pages}</>;
}
