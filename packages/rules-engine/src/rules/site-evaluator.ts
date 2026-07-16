import type { RuleDefinition } from '@shopping-rescue/shared/types';
import type { CrawledPage, CrawledProduct, RobotsPolicyMeta, SitemapCrawlMeta } from '@shopping-rescue/scanner';

export interface FindingInput {
  ruleId: string;
  ruleVersion: number;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  affectedUrl?: string;
  evidence: Record<string, unknown>;
  explanation: string;
  recommendation: string;
}
import { CORE_RULES } from './definitions.js';

export interface SiteEvaluationContext {
  scanId: string;
  rootUrl: string;
  pages: CrawledPage[];
  products: CrawledProduct[];
  robots?: RobotsPolicyMeta;
  sitemap?: SitemapCrawlMeta;
  platform?: string;
}

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /your (company|store|business) name/i,
  /\[company name\]/i,
  /coming soon/i,
  /template demo/i,
];

const POLICY_PATH_PATTERN =
  /\/(contact|about|shipping|delivery|return|refund|privacy|terms|legal|faq)(\/|$)/i;

const RESTRICTIVE_ROBOTS_BLOCK_THRESHOLD = 8;
const HOMEPAGE_SLOW_MS = 3000;
const THIN_POLICY_CHARS = 200;
const MIN_META_DESCRIPTION_CHARS = 40;
const MAX_PRODUCT_FINDINGS_PER_RULE = 3;

const GENERIC_TITLE_PATTERNS = [
  /^home$/i,
  /^welcome$/i,
  /^shop$/i,
  /^store$/i,
  /^my shop$/i,
  /^my store$/i,
  /^untitled/i,
  /^default/i,
  /^website$/i,
];

const CONTACT_SIGNAL_PATTERN = /[\w.+-]+@[\w-]+\.\w{2,}|\+?\d[\d\s().-]{7,}\d/;

const ORGANIZATION_TYPES = new Set([
  'organization',
  'localbusiness',
  'store',
  'onlinestore',
  'corporation',
]);

const POLICY_PAGE_TYPES = new Set([
  'contact',
  'privacy',
  'terms',
  'shipping',
  'returns',
  'about',
]);

function flattenJsonLd(node: unknown): Record<string, unknown>[] {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) {
    return node.flatMap((item) => flattenJsonLd(item));
  }
  const obj = node as Record<string, unknown>;
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    return (obj['@graph'] as unknown[]).flatMap((item) => flattenJsonLd(item));
  }
  return [obj];
}

function pagesHaveOrganizationSchema(pages: CrawledPage[]): boolean {
  for (const page of pages) {
    for (const block of page.jsonLd) {
      for (const item of flattenJsonLd(block)) {
        const type = item['@type'];
        const types = Array.isArray(type) ? type : [type];
        if (
          types.some((value) => ORGANIZATION_TYPES.has(String(value).toLowerCase()))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function isGenericTitle(title?: string): boolean {
  if (!title?.trim()) return true;
  const trimmed = title.trim();
  if (trimmed.length < 8) return true;
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isPolicyPath(url: string): boolean {
  try {
    return POLICY_PATH_PATTERN.test(new URL(url).pathname);
  } catch {
    return POLICY_PATH_PATTERN.test(url);
  }
}

function evaluateRobotsRules(
  scanId: string,
  rootUrl: string,
  robots: RobotsPolicyMeta | undefined,
  rules: Map<string, RuleDefinition>,
): FindingInput[] {
  if (!robots) return [];

  const findings: FindingInput[] = [];

  if (!robots.fetched) {
    const rule = rules.get('SQ-004');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: robots.robotsUrl || `${rootUrl.replace(/\/$/, '')}/robots.txt`,
          evidence: {
            robotsUrl: robots.robotsUrl,
            fetched: false,
          },
          explanation:
            'robots.txt was not found (HTTP 404) or could not be retrieved during the scan.',
          confidence: 0.95,
        }),
      );
    }
    return findings;
  }

  const blockedPolicyUrls = robots.blockedUrls.filter(isPolicyPath);

  if (blockedPolicyUrls.length > 0) {
    const rule = rules.get('SQ-005');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: robots.robotsUrl,
          evidence: {
            robotsUrl: robots.robotsUrl,
            blockedPolicyUrls,
            blockedCount: robots.blockedCount,
          },
          explanation: `robots.txt blocks ${blockedPolicyUrls.length} policy or contact URL(s) that shoppers and crawlers typically need.`,
          confidence: 0.95,
        }),
      );
    }
  }

  if (robots.blockedCount >= RESTRICTIVE_ROBOTS_BLOCK_THRESHOLD) {
    const rule = rules.get('SQ-006');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: robots.robotsUrl,
          evidence: {
            robotsUrl: robots.robotsUrl,
            blockedCount: robots.blockedCount,
            sampleBlockedUrls: robots.blockedUrls.slice(0, 10),
          },
          explanation: `robots.txt blocked ${robots.blockedCount} public URL(s) during the scan — this may be overly restrictive for search visibility.`,
          confidence: 0.8,
        }),
      );
    }
  }

  return findings;
}

function evaluateSitemapRules(
  scanId: string,
  rootUrl: string,
  sitemap: SitemapCrawlMeta | undefined,
  rules: Map<string, RuleDefinition>,
): FindingInput[] {
  if (!sitemap || sitemap.fetched) return [];

  const rule = rules.get('SQ-012');
  if (!rule) return [];

  const sitemapUrl = `${rootUrl.replace(/\/$/, '')}/sitemap.xml`;

  return [
    makeFinding(scanId, rule, {
      affectedUrl: sitemapUrl,
      evidence: {
        sitemapUrl,
        fetched: false,
        checkedPaths: ['/sitemap.xml', '/sitemap_index.xml'],
      },
      explanation:
        'No XML sitemap could be retrieved from /sitemap.xml, /sitemap_index.xml, or robots.txt Sitemap directives.',
      confidence: 0.95,
    }),
  ];
}

function hasPageType(pages: CrawledPage[], types: string[]): CrawledPage | undefined {
  return pages.find(
    (p) =>
      types.includes(p.pageType) &&
      p.httpStatus >= 200 &&
      p.httpStatus < 400 &&
      p.visibleText.length > 100,
  );
}

function hasPageMatching(pages: CrawledPage[], pattern: RegExp): CrawledPage | undefined {
  return pages.find(
    (p) =>
      pattern.test(p.normalizedUrl) &&
      p.httpStatus >= 200 &&
      p.httpStatus < 400 &&
      p.visibleText.length > 50,
  );
}

function makeFinding(
  scanId: string,
  rule: RuleDefinition,
  opts: {
    affectedUrl?: string;
    evidence: Record<string, unknown>;
    explanation: string;
    confidence?: number;
  },
): FindingInput {
  return {
    ruleId: rule.id,
    ruleVersion: rule.version,
    title: rule.title,
    category: rule.category,
    severity: rule.severity,
    confidence: opts.confidence ?? (rule.confidenceMethod === 'deterministic' ? 0.95 : 0.75),
    affectedUrl: opts.affectedUrl,
    evidence: opts.evidence,
    explanation: opts.explanation,
    recommendation: rule.remediationTemplate,
  };
}

export function evaluateSiteRules(context: SiteEvaluationContext): FindingInput[] {
  const findings: FindingInput[] = [];
  const { scanId, rootUrl, pages, products, robots, sitemap, platform } = context;
  const rules = new Map(CORE_RULES.map((r) => [r.id, r]));

  findings.push(...evaluateRobotsRules(scanId, rootUrl, robots, rules));
  findings.push(...evaluateSitemapRules(scanId, rootUrl, sitemap, rules));

  const home = pages.find((p) => p.pageType === 'home' || p.normalizedUrl === rootUrl) ?? pages[0];

  // SQ-001: HTTPS
  if (home && !home.isHttps && !rootUrl.startsWith('https://')) {
    const rule = rules.get('SQ-001')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { url: rootUrl, protocol: 'http' },
        explanation: 'The site root URL does not use HTTPS.',
      }),
    );
  }

  // SQ-002: Homepage error
  if (home && home.httpStatus >= 400) {
    const rule = rules.get('SQ-002')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: home.url,
        evidence: { httpStatus: home.httpStatus },
        explanation: `Homepage returned HTTP ${home.httpStatus}.`,
      }),
    );
  }

  // BI-001: Contact
  if (!hasPageType(pages, ['contact']) && !hasPageMatching(pages, /contact/i)) {
    const rule = rules.get('BI-001')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { pagesChecked: pages.length },
        explanation: 'No contact page with sufficient content was found during the crawl.',
      }),
    );
  }

  // BI-002: Privacy
  if (!hasPageType(pages, ['privacy']) && !hasPageMatching(pages, /privacy/i)) {
    const rule = rules.get('BI-002')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { pagesChecked: pages.length },
        explanation: 'No privacy policy page was found.',
      }),
    );
  }

  // BI-003: Terms
  if (!hasPageType(pages, ['terms']) && !hasPageMatching(pages, /terms|legal/i)) {
    const rule = rules.get('BI-003')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { pagesChecked: pages.length },
        explanation: 'No terms and conditions page was found.',
        confidence: 0.7,
      }),
    );
  }

  // SH-001: Shipping
  if (!hasPageType(pages, ['shipping']) && !hasPageMatching(pages, /shipping|delivery/i)) {
    const rule = rules.get('SH-001')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { pagesChecked: pages.length },
        explanation: 'No shipping or delivery policy page was found.',
      }),
    );
  }

  // RR-001: Returns
  if (!hasPageType(pages, ['returns']) && !hasPageMatching(pages, /return|refund/i)) {
    const rule = rules.get('RR-001')!;
    findings.push(
      makeFinding(scanId, rule, {
        affectedUrl: rootUrl,
        evidence: { pagesChecked: pages.length },
        explanation: 'No returns or refund policy page was found.',
      }),
    );
  }

  // BI-004: About
  if (!hasPageType(pages, ['about']) && !hasPageMatching(pages, /about/i)) {
    const rule = rules.get('BI-004');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: rootUrl,
          evidence: { pagesChecked: pages.length },
          explanation: 'No about page describing the business was found.',
        }),
      );
    }
  }

  // BI-005: Organization JSON-LD
  if (!pagesHaveOrganizationSchema(pages)) {
    const rule = rules.get('BI-005');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: rootUrl,
          evidence: { pagesChecked: pages.length },
          explanation:
            'No Organization or LocalBusiness structured data was found on crawled pages.',
          confidence: 0.8,
        }),
      );
    }
  }

  // BI-006: Contact without email/phone
  const contactPage =
    hasPageType(pages, ['contact']) ?? hasPageMatching(pages, /contact/i);
  if (contactPage && !CONTACT_SIGNAL_PATTERN.test(contactPage.visibleText)) {
    const rule = rules.get('BI-006');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: contactPage.url,
          evidence: { pageType: contactPage.pageType },
          explanation:
            'A contact page was found but no email address or phone number was detected in its visible text.',
          confidence: 0.75,
        }),
      );
    }
  }

  // TR-002: FAQ
  if (!hasPageType(pages, ['faq']) && !hasPageMatching(pages, /faq|help/i)) {
    const rule = rules.get('TR-002');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: rootUrl,
          evidence: { pagesChecked: pages.length },
          explanation: 'No FAQ or help page was found.',
          confidence: 0.7,
        }),
      );
    }
  }

  if (home) {
    // SQ-007: Homepage title
    if (isGenericTitle(home.title)) {
      const rule = rules.get('SQ-007');
      if (rule) {
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: home.url,
            evidence: { title: home.title ?? '' },
            explanation: home.title
              ? `Homepage title "${home.title}" looks generic or too short.`
              : 'Homepage is missing a title tag.',
          }),
        );
      }
    }

    // SQ-008: Meta description
    if (!home.metaDescription || home.metaDescription.trim().length < MIN_META_DESCRIPTION_CHARS) {
      const rule = rules.get('SQ-008');
      if (rule) {
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: home.url,
            evidence: {
              metaDescriptionLength: home.metaDescription?.length ?? 0,
            },
            explanation: 'Homepage meta description is missing or too short.',
            confidence: 0.9,
          }),
        );
      }
    }

    // SQ-009: Slow homepage
    if (home.responseTimeMs > HOMEPAGE_SLOW_MS) {
      const rule = rules.get('SQ-009');
      if (rule) {
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: home.url,
            evidence: { responseTimeMs: home.responseTimeMs },
            explanation: `Homepage responded in ${home.responseTimeMs}ms (threshold: ${HOMEPAGE_SLOW_MS}ms).`,
          }),
        );
      }
    }

    // SQ-010: lang attribute
    if (!home.language?.trim()) {
      const rule = rules.get('SQ-010');
      if (rule) {
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: home.url,
            evidence: {},
            explanation: 'Homepage HTML lang attribute was not detected.',
            confidence: 0.9,
          }),
        );
      }
    }
  }

  // TR-003: Thin policy pages
  const thinPolicyPage = pages.find(
    (page) =>
      POLICY_PAGE_TYPES.has(page.pageType) &&
      page.httpStatus >= 200 &&
      page.httpStatus < 400 &&
      page.visibleText.length < THIN_POLICY_CHARS,
  );
  if (thinPolicyPage) {
    const rule = rules.get('TR-003');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: thinPolicyPage.url,
          evidence: {
            pageType: thinPolicyPage.pageType,
            visibleTextLength: thinPolicyPage.visibleText.length,
          },
          explanation: `The ${thinPolicyPage.pageType} page has very little visible content (${thinPolicyPage.visibleText.length} characters).`,
          confidence: 0.8,
        }),
      );
    }
  }

  // SQ-003: Broken policy pages
  for (const page of pages.filter((p) =>
    ['contact', 'privacy', 'terms', 'shipping', 'returns'].includes(p.pageType),
  )) {
    if (page.httpStatus >= 400) {
      const rule = rules.get('SQ-003')!;
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: page.url,
          evidence: { httpStatus: page.httpStatus, pageType: page.pageType },
          explanation: `The ${page.pageType} page returned HTTP ${page.httpStatus}.`,
        }),
      );
    }
  }

  // TR-001: Placeholder
  for (const page of pages) {
    const match = PLACEHOLDER_PATTERNS.find((p) => p.test(page.visibleText));
    if (match) {
      const rule = rules.get('TR-001')!;
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: page.url,
          evidence: { pattern: match.source, excerpt: page.visibleText.slice(0, 200) },
          explanation: 'Placeholder or template text was detected on a crawled page.',
        }),
      );
      break;
    }
  }

  // PR-001 … PR-005: Products
  let pr003Count = 0;
  let pr004Count = 0;

  for (const product of products) {
    if (!product.price && !product.jsonLdPrice) {
      const rule = rules.get('PR-001')!;
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: product.url,
          evidence: { title: product.title, jsonLd: true },
          explanation: `Product "${product.title ?? 'Unknown'}" has no price in structured data.`,
          confidence: 0.9,
        }),
      );
    }
    if (!product.description || product.description.length < 100) {
      const rule = rules.get('PR-002')!;
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: product.url,
          evidence: {
            title: product.title,
            descriptionLength: product.description?.length ?? 0,
          },
          explanation: `Product "${product.title ?? 'Unknown'}" has a thin or missing description.`,
          confidence: 0.7,
        }),
      );
    }
    if (!product.imageUrl && pr003Count < MAX_PRODUCT_FINDINGS_PER_RULE) {
      const rule = rules.get('PR-003');
      if (rule) {
        pr003Count += 1;
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: product.url,
            evidence: { title: product.title },
            explanation: `Product "${product.title ?? 'Unknown'}" has no image in structured data.`,
            confidence: 0.9,
          }),
        );
      }
    }
    if (!product.jsonLdAvailability && pr004Count < MAX_PRODUCT_FINDINGS_PER_RULE) {
      const rule = rules.get('PR-004');
      if (rule) {
        pr004Count += 1;
        findings.push(
          makeFinding(scanId, rule, {
            affectedUrl: product.url,
            evidence: { title: product.title, availability: product.availability },
            explanation: `Product "${product.title ?? 'Unknown'}" does not specify availability in JSON-LD.`,
            confidence: 0.85,
          }),
        );
      }
    }
  }

  const hasProductSignals =
    platform === 'shopify' ||
    platform === 'woocommerce' ||
    pages.some((p) => p.pageType === 'product' || p.pageType === 'collection');

  if (products.length === 0 && hasProductSignals) {
    const rule = rules.get('PR-005');
    if (rule) {
      findings.push(
        makeFinding(scanId, rule, {
          affectedUrl: rootUrl,
          evidence: { platform: platform ?? 'unknown', pagesCrawled: pages.length },
          explanation:
            'Product or collection pages were detected but no Product structured data was extracted.',
          confidence: 0.8,
        }),
      );
    }
  }

  return findings;
}

export { CORE_RULES, RULES_VERSION } from './definitions.js';
