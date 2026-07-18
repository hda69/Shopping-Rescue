import { createLogger, hashContent, getPlanLimits } from '@shopping-rescue/shared';
import { normalizeUrl } from '@shopping-rescue/shared/validation';
import { validateUrlSafe } from './url-validator.js';
import { CRAWLER_USER_AGENT } from './constants.js';
import {
  createPlaywrightSession,
  fetchPageWithPlaywright,
} from './playwright-crawler.js';
import { parseRobotsPolicy, toRobotsMeta, fetchRobotsTxt, type RobotsPolicyMeta } from './robots.js';
import { discoverSitemapPageUrls, type SitemapCrawlMeta } from './sitemap.js';

export { CRAWLER_USER_AGENT } from './constants.js';

const logger = createLogger({ package: 'scanner' });

const PRIORITY_PATHS = [
  '/',
  '/contact',
  '/pages/contact',
  '/about',
  '/pages/about-us',
  '/shipping',
  '/pages/shipping-policy',
  '/delivery',
  '/returns',
  '/pages/refund-policy',
  '/refund-policy',
  '/privacy',
  '/pages/privacy-policy',
  '/privacy-policy',
  '/terms',
  '/pages/terms-of-service',
  '/terms-of-service',
  '/legal',
  '/faq',
  '/cart',
  '/collections/all',
  '/products',
];

const PAGE_TYPE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /\/contact/i, type: 'contact' },
  { pattern: /\/about/i, type: 'about' },
  { pattern: /\/shipping|\/delivery/i, type: 'shipping' },
  { pattern: /\/return|\/refund/i, type: 'returns' },
  { pattern: /\/privacy/i, type: 'privacy' },
  { pattern: /\/terms|\/legal/i, type: 'terms' },
  { pattern: /\/faq/i, type: 'faq' },
  { pattern: /\/cart/i, type: 'cart' },
  { pattern: /\/products?\//i, type: 'product' },
  { pattern: /\/collections?\//i, type: 'collection' },
  { pattern: /^\/$|\/home/i, type: 'home' },
];

export interface CrawledPage {
  url: string;
  normalizedUrl: string;
  pageType: string;
  httpStatus: number;
  title?: string;
  metaDescription?: string;
  language?: string;
  contentHash: string;
  jsonLd: unknown[];
  visibleText: string;
  responseTimeMs: number;
  isHttps: boolean;
}

export interface CrawledProduct {
  url: string;
  title?: string;
  price?: string;
  currency?: string;
  availability?: string;
  jsonLdPrice?: string;
  jsonLdAvailability?: string;
  imageUrl?: string;
  description?: string;
}

export interface SiteCrawlResult {
  rootUrl: string;
  platform: string;
  pages: CrawledPage[];
  products: CrawledProduct[];
  errors: string[];
  robots: RobotsPolicyMeta;
  sitemap: SitemapCrawlMeta;
}

export interface SiteCrawlOptions {
  maxPages?: number;
  maxProducts?: number;
  timeoutMs?: number;
  onProgress?: (progress: {
    processedPages: number;
    crawledPages: number;
    queuedPages: number;
    maxPages: number;
  }) => void | Promise<void>;
}

function detectPageType(url: string): string {
  for (const { pattern, type } of PAGE_TYPE_PATTERNS) {
    if (pattern.test(url)) return type;
  }
  return 'other';
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim().slice(0, 500);
}

function extractMetaDescription(html: string): string | undefined {
  const match = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  return match?.[1]?.trim().slice(0, 1000);
}

function extractLanguage(html: string): string | undefined {
  const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  return match?.[1]?.slice(0, 10);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}

function extractJsonLd(html: string): unknown[] {
  const results: unknown[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      results.push(JSON.parse(match[1]!));
    } catch {
      // skip invalid JSON-LD
    }
  }
  return results;
}

function collectInternalLinks(html: string, baseUrl: URL): string[] {
  const links = new Set<string>();
  const regex = /href=["']([^"'#]+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const href = match[1]!;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:'))
        continue;
      const resolved = new URL(href, baseUrl);
      if (resolved.origin === baseUrl.origin) {
        links.add(normalizeUrl(resolved.href));
      }
    } catch {
      // skip invalid URLs
    }
  }
  return [...links];
}

function flattenJsonLd(node: unknown): Record<string, unknown>[] {
  if (!node || typeof node !== 'object') return [];
  const obj = node as Record<string, unknown>;
  if (Array.isArray(node)) {
    return node.flatMap((item) => flattenJsonLd(item));
  }
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    return (obj['@graph'] as unknown[]).flatMap((item) => flattenJsonLd(item));
  }
  return [obj];
}

function extractProductsFromJsonLd(
  jsonLd: unknown[],
  pageUrl: string,
): CrawledProduct[] {
  const products: CrawledProduct[] = [];
  for (const block of jsonLd) {
    for (const item of flattenJsonLd(block)) {
      const type = item['@type'];
      const types = Array.isArray(type) ? type : [type];
      if (!types.some((t) => String(t).toLowerCase().includes('product'))) continue;

      const offers = item.offers as Record<string, unknown> | Record<string, unknown>[] | undefined;
      const offer = Array.isArray(offers) ? offers[0] : offers;

      products.push({
        url: String(item.url ?? pageUrl),
        title: item.name ? String(item.name) : undefined,
        price: offer?.price ? String(offer.price) : undefined,
        currency: offer?.priceCurrency ? String(offer.priceCurrency) : undefined,
        availability: offer?.availability ? String(offer.availability) : undefined,
        jsonLdPrice: offer?.price ? String(offer.price) : undefined,
        jsonLdAvailability: offer?.availability ? String(offer.availability) : undefined,
        imageUrl: item.image
          ? String(Array.isArray(item.image) ? item.image[0] : item.image)
          : undefined,
        description: item.description ? String(item.description).slice(0, 2000) : undefined,
      });
    }
  }
  return products;
}

function detectPlatform(html: string, url: string): string {
  if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) return 'shopify';
  if (html.includes('woocommerce') || html.includes('wp-content')) return 'woocommerce';
  if (url.includes('myshopify.com')) return 'shopify';
  return 'unknown';
}

async function fetchPage(
  url: string,
  timeoutMs: number,
): Promise<{ html: string; status: number; timeMs: number } | { error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const start = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': CRAWLER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    const html = await response.text();
    return { html, status: response.status, timeMs: Date.now() - start };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    return { error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function crawlSite(
  rootUrl: string,
  options: SiteCrawlOptions = {},
): Promise<SiteCrawlResult> {
  const useFetch = process.env.CRAWLER_ENGINE === 'fetch';

  if (useFetch) {
    return crawlSiteWithFetch(rootUrl, options);
  }

  const session = await createPlaywrightSession();
  try {
    return await crawlSiteInternal(rootUrl, options, async (url, timeoutMs) => {
      return fetchPageWithPlaywright(session.page, url, timeoutMs);
    });
  } finally {
    await session.close();
  }
}

async function crawlSiteWithFetch(
  rootUrl: string,
  options: SiteCrawlOptions = {},
): Promise<SiteCrawlResult> {
  return crawlSiteInternal(rootUrl, options, fetchPage);
}

type PageFetchResult =
  | { html: string; status: number; timeMs: number; finalUrl?: string }
  | { error: string };

type PageFetcher = (url: string, timeoutMs: number) => Promise<PageFetchResult>;

async function crawlSiteInternal(
  rootUrl: string,
  options: SiteCrawlOptions,
  fetchPageFn: PageFetcher,
): Promise<SiteCrawlResult> {
  const limits = getPlanLimits('free');
  const maxPages = options.maxPages ?? limits.maxPages;
  const maxProducts = options.maxProducts ?? limits.maxProducts;
  const timeoutMs = options.timeoutMs ?? 15000;

  const validation = await validateUrlSafe(rootUrl);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const base = validation.url;
  const errors: string[] = [];
  const pages: CrawledPage[] = [];
  const products: CrawledProduct[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];
  let robotsBlockedCount = 0;
  const robotsBlockedUrls: string[] = [];
  const maxBlockedUrlSamples = 25;

  const recordRobotsBlock = (url: string) => {
    robotsBlockedCount += 1;
    if (robotsBlockedUrls.length < maxBlockedUrlSamples) {
      robotsBlockedUrls.push(url);
    }
  };

  const ignoreRobots = process.env.CRAWLER_IGNORE_ROBOTS === '1';
  const robotsFetch = await fetchRobotsTxt(base.origin, timeoutMs);
  const robotsPolicy =
    ignoreRobots || !robotsFetch.content
      ? null
      : parseRobotsPolicy(robotsFetch.robotsUrl, robotsFetch.content);

  const isAllowed = (url: string): boolean => {
    if (!robotsPolicy) return true;
    return robotsPolicy.isAllowed(url);
  };

  const normalizedRoot = normalizeUrl(base.href);
  if (!ignoreRobots && robotsPolicy?.fetched && !isAllowed(normalizedRoot)) {
    throw new Error('Homepage blocked by robots.txt — scan cannot proceed');
  }

  const sitemapDiscovery = await discoverSitemapPageUrls(base.origin, {
    timeoutMs,
    robotsTxt: robotsFetch.content,
    maxUrls: maxPages * 4,
  });

  for (const path of PRIORITY_PATHS) {
    const candidate = normalizeUrl(new URL(path, base).href);
    if (isAllowed(candidate)) {
      queue.push(candidate);
    } else {
      recordRobotsBlock(candidate);
    }
  }

  for (const url of sitemapDiscovery.pageUrls) {
    if (queue.includes(url)) continue;
    if (!isAllowed(url)) {
      recordRobotsBlock(url);
      continue;
    }
    queue.push(url);
  }

  logger.info('Sitemap discovery', {
    fetched: sitemapDiscovery.fetched,
    sourceSitemaps: sitemapDiscovery.sourceSitemaps.length,
    urlsQueued: sitemapDiscovery.pageUrls.length,
  });

  if (queue.length === 0 && robotsPolicy?.fetched) {
    throw new Error('All priority paths blocked by robots.txt — scan cannot proceed');
  }

  let platform = 'unknown';
  let processedPages = 0;

  const emitProgress = async () => {
    if (!options.onProgress) return;
    await options.onProgress({
      processedPages,
      crawledPages: pages.length,
      queuedPages: queue.length,
      maxPages,
    });
  };

  while (queue.length > 0 && pages.length < maxPages) {
    const nextUrl = queue.shift()!;
    if (visited.has(nextUrl)) continue;
    if (!isAllowed(nextUrl)) {
      recordRobotsBlock(nextUrl);
      errors.push(`${nextUrl}: blocked by robots.txt`);
      processedPages += 1;
      await emitProgress();
      continue;
    }
    visited.add(nextUrl);

    logger.info('Crawling page', { url: nextUrl });

    const result = await fetchPageFn(nextUrl, timeoutMs);
    if ('error' in result) {
      errors.push(`${nextUrl}: ${result.error}`);
      processedPages += 1;
      await emitProgress();
      continue;
    }

    const { html, status, timeMs } = result;
    const pageUrl = result.finalUrl ?? nextUrl;
    let normalizedPageUrl: string;
    try {
      normalizedPageUrl = normalizeUrl(pageUrl);
    } catch {
      normalizedPageUrl = pageUrl;
    }

    // Redirects can collapse several queue URLs onto the same final page.
    if (visited.has(normalizedPageUrl) && normalizedPageUrl !== nextUrl) {
      processedPages += 1;
      await emitProgress();
      continue;
    }
    visited.add(normalizedPageUrl);

    if (pages.length === 0) {
      platform = detectPlatform(html, nextUrl);
    }

    const jsonLd = extractJsonLd(html);
    const visibleText = stripHtml(html);

    pages.push({
      url: pageUrl,
      normalizedUrl: normalizedPageUrl,
      pageType: detectPageType(new URL(pageUrl).pathname),
      httpStatus: status,
      title: extractTitle(html),
      metaDescription: extractMetaDescription(html),
      language: extractLanguage(html),
      contentHash: hashContent(visibleText),
      jsonLd,
      visibleText,
      responseTimeMs: timeMs,
      isHttps: pageUrl.startsWith('https://'),
    });

    const pageProducts = extractProductsFromJsonLd(jsonLd, pageUrl);
    for (const product of pageProducts) {
      if (products.length < maxProducts) {
        products.push(product);
      }
    }

    if (pages.length < maxPages) {
      const links = collectInternalLinks(html, new URL(pageUrl));
      for (const link of links) {
        if (visited.has(link) || queue.includes(link)) continue;
        if (!isAllowed(link)) {
          recordRobotsBlock(link);
          continue;
        }
        queue.push(link);
      }
    }

    processedPages += 1;
    await emitProgress();
  }

  logger.info('Crawl complete', {
    pages: pages.length,
    products: products.length,
    platform,
    robotsBlockedCount,
    robotsFetched: robotsPolicy?.fetched ?? false,
    sitemapUrls: sitemapDiscovery.pageUrls.length,
  });

  const robotsMeta = robotsPolicy
    ? toRobotsMeta(robotsPolicy, { urls: robotsBlockedUrls, count: robotsBlockedCount })
    : {
        robotsUrl: robotsFetch.robotsUrl,
        fetched: false,
        blockedUrls: [],
        blockedCount: 0,
      };

  return {
    rootUrl: normalizedRoot,
    platform,
    pages,
    products,
    errors,
    robots: robotsMeta,
    sitemap: {
      fetched: sitemapDiscovery.fetched,
      sourceSitemaps: sitemapDiscovery.sourceSitemaps,
      urlsDiscovered: sitemapDiscovery.pageUrls.length,
    },
  };
}
