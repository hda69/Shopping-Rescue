import { describe, it, expect } from 'vitest';
import { evaluateSiteRules } from '../rules/site-evaluator.js';
import type { CrawledPage } from '@shopping-rescue/scanner';

const basePage: CrawledPage = {
  url: 'https://shop.example.com/',
  normalizedUrl: 'https://shop.example.com/',
  pageType: 'home',
  httpStatus: 200,
  title: 'Acme Running — Trail shoes & apparel',
  metaDescription:
    'Shop trail running shoes and performance apparel with fast EU shipping and easy returns.',
  language: 'en',
  contentHash: 'abc',
  jsonLd: [{ '@type': 'Organization', name: 'Acme Running' }],
  visibleText: 'Welcome to our store with enough content for checks to pass easily here.',
  responseTimeMs: 100,
  isHttps: true,
};

describe('evaluateSiteRules — robots.txt', () => {
  const contextBase = {
    scanId: 'scan-1',
    rootUrl: 'https://shop.example.com/',
    pages: [basePage],
    products: [],
  };

  it('flags missing robots.txt (SQ-004)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      robots: {
        robotsUrl: 'https://shop.example.com/robots.txt',
        fetched: false,
        blockedUrls: [],
        blockedCount: 0,
      },
    });

    expect(findings.some((f) => f.ruleId === 'SQ-004')).toBe(true);
    expect(findings.some((f) => f.ruleId === 'SQ-005')).toBe(false);
  });

  it('flags blocked policy URLs (SQ-005)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      robots: {
        robotsUrl: 'https://shop.example.com/robots.txt',
        fetched: true,
        blockedUrls: [
          'https://shop.example.com/privacy',
          'https://shop.example.com/contact',
        ],
        blockedCount: 2,
      },
    });

    expect(findings.some((f) => f.ruleId === 'SQ-005')).toBe(true);
    expect(findings.some((f) => f.ruleId === 'SQ-004')).toBe(false);
  });

  it('flags overly restrictive robots.txt (SQ-006)', () => {
    const blockedUrls = Array.from({ length: 10 }, (_, i) => `https://shop.example.com/page-${i}`);

    const findings = evaluateSiteRules({
      ...contextBase,
      robots: {
        robotsUrl: 'https://shop.example.com/robots.txt',
        fetched: true,
        blockedUrls,
        blockedCount: 10,
      },
    });

    expect(findings.some((f) => f.ruleId === 'SQ-006')).toBe(true);
  });

  it('flags missing sitemap.xml (SQ-012)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      sitemap: {
        fetched: false,
        sourceSitemaps: [],
        urlsDiscovered: 0,
      },
    });

    expect(findings.some((f) => f.ruleId === 'SQ-012')).toBe(true);
  });

  it('does not flag sitemap when discovery succeeded', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      sitemap: {
        fetched: true,
        sourceSitemaps: ['https://shop.example.com/sitemap.xml'],
        urlsDiscovered: 42,
      },
    });

    expect(findings.some((f) => f.ruleId === 'SQ-012')).toBe(false);
  });

  it('does not flag robots when file exists and nothing important is blocked', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      robots: {
        robotsUrl: 'https://shop.example.com/robots.txt',
        fetched: true,
        blockedUrls: ['https://shop.example.com/admin'],
        blockedCount: 1,
      },
    });

    expect(findings.some((f) => ['SQ-004', 'SQ-005', 'SQ-006'].includes(f.ruleId))).toBe(
      false,
    );
  });
});

describe('evaluateSiteRules — expanded rules', () => {
  const richHome: CrawledPage = {
    ...basePage,
    title: 'Acme Running — Trail shoes & apparel',
    metaDescription:
      'Shop trail running shoes and performance apparel with fast EU shipping and 30-day returns.',
    language: 'en',
    jsonLd: [
      {
        '@type': 'Organization',
        name: 'Acme Running',
        url: 'https://shop.example.com',
      },
    ],
  };

  const contextBase = {
    scanId: 'scan-2',
    rootUrl: 'https://shop.example.com/',
    pages: [
      richHome,
      {
        ...basePage,
        url: 'https://shop.example.com/contact',
        normalizedUrl: 'https://shop.example.com/contact',
        pageType: 'contact',
        visibleText:
          'Contact us anytime at support@shop.example.com or call +33 1 23 45 67 89 for order questions and returns.',
      },
      {
        ...basePage,
        url: 'https://shop.example.com/about',
        normalizedUrl: 'https://shop.example.com/about',
        pageType: 'about',
        visibleText: 'About our company with a long history and team based in Paris serving runners worldwide.',
      },
      {
        ...basePage,
        url: 'https://shop.example.com/privacy',
        normalizedUrl: 'https://shop.example.com/privacy',
        pageType: 'privacy',
        visibleText: 'x'.repeat(250),
      },
      {
        ...basePage,
        url: 'https://shop.example.com/faq',
        normalizedUrl: 'https://shop.example.com/faq',
        pageType: 'faq',
        visibleText: 'Frequently asked questions about shipping returns sizing and payments for our customers.',
      },
    ],
    products: [
      {
        url: 'https://shop.example.com/products/shoe',
        title: 'Trail Shoe',
        price: '99',
        currency: 'EUR',
        jsonLdPrice: '99',
        jsonLdAvailability: 'https://schema.org/InStock',
        imageUrl: 'https://shop.example.com/shoe.jpg',
        description: 'x'.repeat(120),
      },
    ],
    robots: {
      robotsUrl: 'https://shop.example.com/robots.txt',
      fetched: true,
      blockedUrls: [],
      blockedCount: 0,
    },
  };

  it('flags missing Organization schema (BI-005)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      pages: contextBase.pages.map((p) => ({ ...p, jsonLd: [] })),
    });
    expect(findings.some((f) => f.ruleId === 'BI-005')).toBe(true);
  });

  it('flags generic homepage title (SQ-007)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      pages: [{ ...richHome, title: 'Home' }],
    });
    expect(findings.some((f) => f.ruleId === 'SQ-007')).toBe(true);
  });

  it('flags slow homepage (SQ-009)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      pages: [{ ...richHome, responseTimeMs: 4500 }],
    });
    expect(findings.some((f) => f.ruleId === 'SQ-009')).toBe(true);
  });

  it('flags contact page without email or phone (BI-006)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      pages: [
        richHome,
        {
          ...basePage,
          url: 'https://shop.example.com/contact',
          normalizedUrl: 'https://shop.example.com/contact',
          pageType: 'contact',
          visibleText: 'Please fill out the form below and we will get back to you soon.',
        },
      ],
    });
    expect(findings.some((f) => f.ruleId === 'BI-006')).toBe(true);
  });

  it('flags no products on shopify-like site (PR-005)', () => {
    const findings = evaluateSiteRules({
      ...contextBase,
      products: [],
      platform: 'shopify',
      pages: [
        richHome,
        {
          ...basePage,
          url: 'https://shop.example.com/collections/all',
          normalizedUrl: 'https://shop.example.com/collections/all',
          pageType: 'collection',
        },
      ],
    });
    expect(findings.some((f) => f.ruleId === 'PR-005')).toBe(true);
  });
});
