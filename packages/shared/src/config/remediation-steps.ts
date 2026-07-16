import { sortBySeverity } from '../utils/findings';
import type { AppLocale } from '../i18n/locale';
import { REMEDIATION_STEPS_FR } from '../i18n/remediation-steps-fr';
import { RULES_FR } from '../i18n/rules-fr';
import { REMEDIATION_FALLBACK_EN, REMEDIATION_FALLBACK_FR } from '../i18n/labels';

export const REMEDIATION_STEPS: Record<string, string[]> = {
  'SQ-001': [
    'Install an SSL certificate on your hosting (Let\'s Encrypt is free on most hosts).',
    'Force HTTPS redirects for all HTTP URLs.',
    'Update internal links and sitemap to use https:// URLs only.',
    'Re-test the homepage and confirm the padlock icon in the browser.',
  ],
  'SQ-002': [
    'Open your homepage URL in a browser and note the HTTP status code.',
    'Check server logs or hosting panel for 4xx/5xx errors.',
    'Fix application errors, permissions, or firewall rules blocking public access.',
    'Confirm the homepage returns HTTP 200 without authentication.',
  ],
  'SQ-003': [
    'Identify which policy or key page returns an error (see evidence URL/status).',
    'Restore the page content or fix the broken link from your navigation/footer.',
    'Publish the missing policy if the page was never created.',
    'Re-crawl or manually verify the page loads for anonymous visitors.',
  ],
  'BI-001': [
    'Create a dedicated Contact page with email, phone, or contact form.',
    'Add a visible link in the site footer and main navigation.',
    'Include business name and expected response time if possible.',
    'Verify the page is reachable without login and loads over HTTPS.',
  ],
  'BI-002': [
    'Draft a privacy policy covering data collection, cookies, and third parties.',
    'Publish it at a stable URL (e.g. /privacy or /privacy-policy).',
    'Link it from the footer on every page.',
    'Ensure the policy matches your actual data practices (analytics, checkout, etc.).',
  ],
  'BI-003': [
    'Publish terms and conditions covering orders, liability, and governing law.',
    'Link terms from the footer alongside privacy and returns policies.',
    'Use clear merchant identity (legal business name) in the document.',
    'Review with legal counsel if you sell internationally.',
  ],
  'SH-001': [
    'Create a shipping/delivery policy page.',
    'List supported countries, carriers, costs, and typical delivery times.',
    'Mention handling times before dispatch.',
    'Link the policy from product pages and checkout footer.',
  ],
  'RR-001': [
    'Publish a returns/refund policy with return window (e.g. 14 or 30 days).',
    'Explain how customers initiate a return and any restocking fees.',
    'State who pays return shipping where applicable.',
    'Link the policy from footer and checkout.',
  ],
  'PR-001': [
    'Open the affected product page in Shopify/WooCommerce admin.',
    'Ensure price and currency are set on the variant.',
    'Validate JSON-LD Product schema includes offers.price and priceCurrency.',
    'Use Google Rich Results Test to confirm structured data.',
  ],
  'PR-002': [
    'Expand the product description with unique, factual copy (100+ characters).',
    'Include materials, sizing, use cases, and what is in the box.',
    'Avoid duplicate manufacturer text used on every SKU.',
    'Proofread for placeholder or lorem ipsum text.',
  ],
  'TR-001': [
    'Search your theme for lorem ipsum, “company name”, or demo template strings.',
    'Replace placeholders with real business information.',
    'Review About, Contact, and policy pages for leftover theme content.',
    'Publish only after all visible pages show production-ready copy.',
  ],
  'SQ-004': [
    'Create a /robots.txt file at your store root (same host as your homepage).',
    'Start with a permissive default, e.g. `User-agent: *` followed by `Allow: /`.',
    'Add Disallow rules only for admin, cart, or internal paths you do not want indexed.',
    'Verify https://yourdomain.com/robots.txt returns HTTP 200 in a browser.',
  ],
  'SQ-005': [
    'Open robots.txt and search for Disallow rules affecting /contact, /privacy, /shipping, or /returns.',
    'Remove or narrow Disallow patterns that block customer-facing policy pages.',
    'Use Allow rules to explicitly permit critical policy URLs if needed.',
    'Re-run a scan to confirm policy pages are crawlable.',
  ],
  'SQ-006': [
    'Audit all Disallow lines in robots.txt — avoid blocking /products, /collections, or the homepage.',
    'Compare blocked paths with URLs you want visible in Google Search and Shopping.',
    'Remove blanket rules like `Disallow: /` unless the storefront is intentionally private.',
    'Test with Google Search Console URL Inspection after updating robots.txt.',
  ],
  'SQ-012': [
    'Enable or generate an XML sitemap in your platform (Shopify does this automatically at /sitemap.xml).',
    'Verify https://yourdomain.com/sitemap.xml returns HTTP 200.',
    'Add `Sitemap: https://yourdomain.com/sitemap.xml` to robots.txt.',
    'Submit the sitemap in Google Search Console after publishing.',
  ],
  'BI-004': [
    'Create an About page with your business story, team, or operating company name.',
    'Explain what you sell and where you are based.',
    'Link the About page from the footer and main navigation.',
    'Avoid placeholder copy — use verifiable, human-written content.',
  ],
  'BI-005': [
    'Add Organization or LocalBusiness JSON-LD to your homepage or global theme.',
    'Include name, url, logo, and customer service contactPoint where possible.',
    'Validate with Google Rich Results Test.',
    'Keep structured data consistent with visible contact information.',
  ],
  'BI-006': [
    'Add a visible support email and/or phone number on the contact page.',
    'Place contact details above the fold, not hidden behind a form only.',
    'Use the same email shown in Merchant Center business information.',
    'Test the page as a logged-out visitor.',
  ],
  'SQ-007': [
    'Edit the homepage SEO title in your CMS or theme settings.',
    'Use format: Brand — what you sell (e.g. "Acme — Running shoes & apparel").',
    'Avoid single-word titles like "Home" or "Shop".',
    'Keep under ~60 characters when possible.',
  ],
  'SQ-008': [
    'Write a unique meta description for the homepage.',
    'Summarize your catalog, shipping regions, and trust signals in 120–160 characters.',
    'Do not leave the field empty or duplicate the title only.',
    'Preview how it appears in search snippets.',
  ],
  'SQ-009': [
    'Compress large hero images and product photography.',
    'Audit third-party scripts (chat widgets, pixels, apps).',
    'Enable CDN/caching on your storefront host.',
    'Re-test homepage load time from an incognito browser.',
  ],
  'SQ-010': [
    'Set `<html lang="...">` in your theme layout file.',
    'Use the primary language of your storefront (e.g. en, fr, de).',
    'Match language with your Merchant Center feed language where applicable.',
    'Redeploy or publish the theme change.',
  ],
  'TR-002': [
    'Create an FAQ page covering shipping times, returns, sizing, and payments.',
    'Link it from the footer and checkout help areas.',
    'Use real customer questions — not generic filler.',
    'Keep answers specific to your store policies.',
  ],
  'TR-003': [
    'Open the thin policy page listed in the finding.',
    'Add complete policy text customers need before purchase.',
    'Include timeframes, costs, contact method, and geographic scope.',
    'Aim for at least a few substantive paragraphs per policy.',
  ],
  'PR-003': [
    'Upload a high-quality primary image for the affected SKU.',
    'Ensure Product JSON-LD includes an image property.',
    'Use images that match the product sold (not placeholders).',
    'Revalidate structured data after saving.',
  ],
  'PR-004': [
    'Set stock status on the product variant in your admin.',
    'Populate offers.availability in JSON-LD (schema.org InStock / OutOfStock).',
    'Align availability with Merchant Center feed values.',
    'Test with Rich Results after publishing.',
  ],
  'PR-005': [
    'Confirm products are published and visible to guests (not password-protected).',
    'Check that theme outputs Product JSON-LD on product templates.',
    'Install or fix an SEO/schema app if your platform does not emit structured data.',
    'Re-run a scan after publishing at least one complete product page.',
  ],
};

export function getRemediationSteps(
  ruleId: string,
  fallbackRecommendation: string,
  locale: AppLocale = 'en',
): string[] {
  if (locale === 'fr') {
    const steps = REMEDIATION_STEPS_FR[ruleId];
    if (steps?.length) return steps;
    const rule = RULES_FR[ruleId];
    return [
      rule?.remediationTemplate ?? fallbackRecommendation,
      ...REMEDIATION_FALLBACK_FR,
    ];
  }

  const steps = REMEDIATION_STEPS[ruleId];
  if (steps?.length) return steps;
  return [fallbackRecommendation, ...REMEDIATION_FALLBACK_EN];
}

export interface RemediationChecklistItem {
  priority: number;
  findingId: string;
  ruleId: string;
  title: string;
  severity: string;
  recommendation: string;
  steps: string[];
}

export function buildRemediationChecklist(
  findings: Array<{
    id: string;
    ruleId: string;
    title: string;
    severity: string;
    recommendation: string;
  }>,
  locale: AppLocale = 'en',
): RemediationChecklistItem[] {
  const sorted = sortBySeverity(findings);
  return sorted.map((finding, index) => {
    const localized = locale === 'fr' ? RULES_FR[finding.ruleId] : undefined;
    return {
      priority: index + 1,
      findingId: finding.id,
      ruleId: finding.ruleId,
      title: localized?.title ?? finding.title,
      severity: finding.severity,
      recommendation: localized?.remediationTemplate ?? finding.recommendation,
      steps: getRemediationSteps(finding.ruleId, finding.recommendation, locale),
    };
  });
}
