import { notFound } from 'next/navigation';
import { AuditReport, auditReportFixture } from '@shopping-rescue/reporting/pdf';
import { getReportStylesheet } from '@/lib/report-styles';

export const dynamic = 'force-dynamic';

export default function ReportPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const css = getReportStylesheet();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <AuditReport audit={auditReportFixture} />
    </>
  );
}
