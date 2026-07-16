import 'server-only';
import { chromium, type Browser } from 'playwright';
import { renderAuditReportHtml } from './render-html';
import type { AuditReportData } from './types';

async function launchBrowser(): Promise<Browser> {
  const options = {
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  };

  try {
    return await chromium.launch(options);
  } catch (primaryError) {
    try {
      return await chromium.launch({ ...options, channel: 'chrome' });
    } catch {
      throw primaryError;
    }
  }
}

export async function generateAuditPdf(audit: AuditReportData): Promise<Buffer> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2000 },
    });

    const html = renderAuditReportHtml(audit);

    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
