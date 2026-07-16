import 'server-only';

export { generateAuditPdf } from './pdf/generateAuditPdf';
export { renderAuditReportHtml } from './pdf/render-html';
export { mapDetailedScanReportToAuditData } from './pdf/map-report';
export type { DetailedScanReport } from './detailed-report';
export type { AuditReportData } from './pdf/types';

import type { DetailedScanReport } from './detailed-report';
import { generateAuditPdf } from './pdf/generateAuditPdf';
import { mapDetailedScanReportToAuditData } from './pdf/map-report';

export async function renderScanReportPdf(report: DetailedScanReport): Promise<Buffer> {
  const audit = mapDetailedScanReportToAuditData(report);
  return generateAuditPdf(audit);
}
