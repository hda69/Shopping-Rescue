import { notFound } from 'next/navigation';
import { AuditReport, mapDetailedScanReportToAuditData } from '@shopping-rescue/reporting/pdf';
import { loadDetailedScanReport } from '@/lib/full-report';
import { getReportStylesheet } from '@/lib/report-styles';

export const dynamic = 'force-dynamic';

export default async function PrintReportPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  const report = await loadDetailedScanReport(scanId);

  if (!report) {
    notFound();
  }

  const audit = mapDetailedScanReportToAuditData(report);
  const css = getReportStylesheet();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <AuditReport audit={audit} />
    </>
  );
}
