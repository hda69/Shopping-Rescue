import { loadDetailedScanReport } from '@/lib/full-report';
import { printScanReportToPdf } from '@/lib/print-pdf';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ scanId: string }> },
) {
  const { scanId } = await context.params;
  const report = await loadDetailedScanReport(scanId);

  if (!report) {
    return new Response('Report not available. Unlock the full audit first.', { status: 403 });
  }

  try {
    const pdfBuffer = await printScanReportToPdf(scanId);
    const filename = `shopping-rescue-report-${scanId.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[pdf]', scanId, message);
    return new Response(
      'Failed to generate PDF. Ensure Playwright is installed: pnpm exec playwright install chromium',
      { status: 500 },
    );
  }
}
