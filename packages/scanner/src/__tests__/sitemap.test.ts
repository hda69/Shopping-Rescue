import { describe, it, expect } from 'vitest';
import { extractSitemapUrlsFromRobots, parseSitemapXml } from '../sitemap.js';

describe('extractSitemapUrlsFromRobots', () => {
  it('parses Sitemap directives', () => {
    const urls = extractSitemapUrlsFromRobots(`
User-agent: *
Disallow:

Sitemap: https://shop.example.com/sitemap.xml
Sitemap: https://shop.example.com/sitemap_products.xml
`);

    expect(urls).toEqual([
      'https://shop.example.com/sitemap.xml',
      'https://shop.example.com/sitemap_products.xml',
    ]);
  });
});

describe('parseSitemapXml', () => {
  it('parses urlset sitemap', () => {
    const parsed = parseSitemapXml(`<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://shop.example.com/</loc></url>
  <url><loc>https://shop.example.com/products/shoe</loc></url>
</urlset>`);

    expect(parsed.pageUrls).toEqual([
      'https://shop.example.com/',
      'https://shop.example.com/products/shoe',
    ]);
    expect(parsed.childSitemaps).toEqual([]);
  });

  it('parses sitemap index', () => {
    const parsed = parseSitemapXml(`<?xml version="1.0"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://shop.example.com/sitemap_products_1.xml</loc></sitemap>
  <sitemap><loc>https://shop.example.com/sitemap_pages_1.xml</loc></sitemap>
</sitemapindex>`);

    expect(parsed.childSitemaps).toHaveLength(2);
    expect(parsed.pageUrls).toEqual([]);
  });
});
