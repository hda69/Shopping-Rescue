import { printFixtureReportToPdf } from '@/lib/print-pdf';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const pdfBuffer = await printFixtureReportToPdf();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="shopping-rescue-report-fixture.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[dev/report-preview/pdf]', error);
    return new Response('Failed to generate PDF. Run: pnpm exec playwright install chromium', {
      status: 500,
    });
  }
}
