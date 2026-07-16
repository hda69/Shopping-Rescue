import { normalizeUrl } from '@shopping-rescue/shared/validation';
import { CRAWLER_USER_AGENT } from './constants.js';
import { validateUrlSafe } from './url-validator.js';

export interface ParsedSitemap {
  pageUrls: string[];
  childSitemaps: string[];
}

export interface SitemapDiscoveryResult {
  fetched: boolean;
  sourceSitemaps: string[];
  pageUrls: string[];
}

export interface SitemapCrawlMeta {
  fetched: boolean;
  sourceSitemaps: string[];
  urlsDiscovered: number;
}

const DEFAULT_SITEMAP_PATHS = ['/sitemap.xml', '/sitemap_index.xml'];

export function buildSitemapUrl(origin: string, path = '/sitemap.xml'): string {
  return new URL(path, origin).href;
}

export function extractSitemapUrlsFromRobots(robotsTxt: string): string[] {
  const urls = new Set<string>();

  for (const line of robotsTxt.split('\n')) {
    const match = line.match(/^\s*sitemap:\s*(\S+)/i);
    if (match?.[1]) {
      urls.add(match[1].trim());
    }
  }

  return [...urls];
}

export function parseSitemapXml(xml: string): ParsedSitemap {
  const pageUrls: string[] = [];
  const childSitemaps: string[] = [];
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;

  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    const loc = match[1]?.trim();
    if (!loc) continue;
    if (isIndex) {
      childSitemaps.push(loc);
    } else {
      pageUrls.push(loc);
    }
  }

  return { pageUrls, childSitemaps };
}

async function fetchSitemapXml(url: string, timeoutMs: number): Promise<string | null> {
  const validation = await validateUrlSafe(url);
  if (!validation.valid) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(validation.url.href, {
      headers: {
        'User-Agent': CRAWLER_USER_AGENT,
        Accept: 'application/xml,text/xml,text/plain,*/*',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) return null;
    const text = await response.text();
    return text.slice(0, 2_000_000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

function prioritizeSitemapUrls(urls: string[], origin: string, maxUrls: number): string[] {
  const normalized = new Set<string>();

  for (const url of urls) {
    if (!isSameOrigin(url, origin)) continue;
    try {
      normalized.add(normalizeUrl(url));
    } catch {
      continue;
    }
    if (normalized.size >= maxUrls) break;
  }

  const list = [...normalized];
  const score = (url: string): number => {
    const path = new URL(url).pathname.toLowerCase();
    if (/\/products?\//.test(path)) return 0;
    if (/\/collections?\//.test(path)) return 1;
    if (/\/(contact|about|shipping|return|refund|privacy|terms|faq)/.test(path)) return 2;
    if (path === '/' || path === '') return 3;
    return 4;
  };

  return list.sort((a, b) => score(a) - score(b)).slice(0, maxUrls);
}

export async function discoverSitemapPageUrls(
  origin: string,
  options: {
    timeoutMs?: number;
    robotsTxt?: string | null;
    maxUrls?: number;
    maxSitemapFiles?: number;
  } = {},
): Promise<SitemapDiscoveryResult> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const maxUrls = options.maxUrls ?? 80;
  const maxSitemapFiles = options.maxSitemapFiles ?? 6;

  const candidateSitemaps = new Set<string>();

  if (options.robotsTxt) {
    for (const url of extractSitemapUrlsFromRobots(options.robotsTxt)) {
      candidateSitemaps.add(url);
    }
  }

  for (const path of DEFAULT_SITEMAP_PATHS) {
    candidateSitemaps.add(buildSitemapUrl(origin, path));
  }

  const fetchedSitemaps: string[] = [];
  const pendingSitemaps = [...candidateSitemaps];
  const processedSitemaps = new Set<string>();
  const discoveredPageUrls: string[] = [];

  while (pendingSitemaps.length > 0 && processedSitemaps.size < maxSitemapFiles) {
    const sitemapUrl = pendingSitemaps.shift()!;
    if (processedSitemaps.has(sitemapUrl)) continue;
    processedSitemaps.add(sitemapUrl);

    const xml = await fetchSitemapXml(sitemapUrl, timeoutMs);
    if (!xml) continue;

    fetchedSitemaps.push(sitemapUrl);
    const parsed = parseSitemapXml(xml);
    discoveredPageUrls.push(...parsed.pageUrls);

    for (const child of parsed.childSitemaps) {
      if (!processedSitemaps.has(child) && !pendingSitemaps.includes(child)) {
        pendingSitemaps.push(child);
      }
    }
  }

  return {
    fetched: fetchedSitemaps.length > 0,
    sourceSitemaps: fetchedSitemaps,
    pageUrls: prioritizeSitemapUrls(discoveredPageUrls, origin, maxUrls),
  };
}
