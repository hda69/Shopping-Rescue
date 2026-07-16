import { createLogger } from '@shopping-rescue/shared';
import { validateUrlSafe, type UrlValidationResult } from './url-validator.js';
import { crawlSite } from './site-crawler.js';
import { createPlaywrightSession, fetchPageWithPlaywright } from './playwright-crawler.js';

export interface CrawlOptions {
  maxPages?: number;
  timeoutMs?: number;
  maxRedirects?: number;
}

export interface CrawlResult {
  url: string;
  statusCode?: number;
  html?: string;
  error?: string;
}

const logger = createLogger({ package: 'scanner' });

export { CRAWLER_USER_AGENT } from './constants.js';

export async function crawlUrl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const validation: UrlValidationResult = await validateUrlSafe(url);
  if (!validation.valid) {
    logger.warn('Crawl rejected by URL validator', { url, reason: validation.reason });
    return { url, error: validation.reason };
  }

  const timeoutMs = options.timeoutMs ?? 15000;
  const session = await createPlaywrightSession();

  try {
    const result = await fetchPageWithPlaywright(session.page, validation.url.href, timeoutMs);
    if ('error' in result) {
      return { url, error: result.error };
    }
    return { url: result.finalUrl, statusCode: result.status, html: result.html };
  } finally {
    await session.close();
  }
}

export { crawlSite };
