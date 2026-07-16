import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { createLogger } from '@shopping-rescue/shared';
import { normalizeUrl } from '@shopping-rescue/shared/validation';
import { validateUrlSafe } from './url-validator.js';
import { CRAWLER_USER_AGENT } from './constants.js';

const logger = createLogger({ package: 'scanner-playwright' });

export interface PlaywrightSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  close: () => Promise<void>;
}

export type PlaywrightFetchResult =
  | { html: string; status: number; timeMs: number; finalUrl: string }
  | { error: string };

async function launchBrowser(): Promise<Browser> {
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

export async function createPlaywrightSession(): Promise<PlaywrightSession> {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: CRAWLER_USER_AGENT,
    javaScriptEnabled: true,
    locale: 'en-US',
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'media' || type === 'font') {
      return route.abort();
    }
    return route.continue();
  });

  const page = await context.newPage();

  return {
    browser,
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

export async function fetchPageWithPlaywright(
  page: Page,
  url: string,
  timeoutMs: number,
): Promise<PlaywrightFetchResult> {
  const validation = await validateUrlSafe(url);
  if (!validation.valid) {
    return { error: validation.reason };
  }

  const start = Date.now();

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });

    await page.waitForLoadState('networkidle', { timeout: Math.min(5000, timeoutMs) }).catch(() => {
      // SPAs may never reach networkidle — continue with DOM content
    });

    const finalUrl = page.url();
    const finalValidation = await validateUrlSafe(finalUrl);
    if (!finalValidation.valid) {
      return { error: `Redirect blocked: ${finalValidation.reason}` };
    }

    const html = await page.content();

    return {
      html,
      status: response?.status() ?? 0,
      timeMs: Date.now() - start,
      finalUrl: normalizeUrl(finalUrl),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Navigation failed';
    logger.warn('Playwright fetch failed', { url, error: message });
    return { error: message };
  }
}
