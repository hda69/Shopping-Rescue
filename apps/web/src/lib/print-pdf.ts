import 'server-only';

import type { Browser } from 'playwright';

async function loadChromium() {
  const { chromium } = await import('playwright');
  return chromium;
}

async function launchBrowser(): Promise<Browser> {
  const chromium = await loadChromium();
  const options = {
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  };

  try {
    return await chromium.launch({ ...options, channel: 'chrome' });
  } catch {
    return chromium.launch(options);
  }
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function printUrlToPdf(url: string): Promise<Buffer> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2000 },
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function printScanReportToPdf(scanId: string): Promise<Buffer> {
  const url = `${getAppBaseUrl()}/print/report/${encodeURIComponent(scanId)}`;
  return printUrlToPdf(url);
}

export async function printFixtureReportToPdf(): Promise<Buffer> {
  const url = `${getAppBaseUrl()}/dev/report-preview`;
  return printUrlToPdf(url);
}
