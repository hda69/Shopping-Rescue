import type { AuditReportData } from '../types';

export const auditReportFixture: AuditReportData = {
  auditId: 'fixture-audit-001',
  generatedAt: '2026-07-13T12:00:00.000Z',
  completedAt: '2026-07-13T11:58:00.000Z',
  siteUrl: 'https://www.example-store.com',
  platform: 'shopify',
  confidence: 'high',
  riskScore: 62,
  riskLevel: 'high',
  pagesCrawled: 15,
  productsAnalyzed: 20,
  disclaimer:
    'This report is an independent automated diagnostic based on publicly accessible storefront data. It does not guarantee Google Merchant Center reinstatement and is not legal advice. Findings indicate probable causes — verify each item against your live site and Google Merchant Center policies before requesting review.',
  locale: 'en',
  findings: [
    {
      id: 'f1',
      number: 1,
      severity: 'critical',
      category: 'Business identity',
      ruleId: 'SQ-002',
      confidence: 0.92,
      title: 'Missing or incomplete contact information on key pages',
      affectedUrl: 'https://www.example-store.com/pages/contact',
      whatWeFound:
        'The contact page does not display a visible business address and phone number in the main content area. Merchant Center misrepresentation policies require clear, accessible contact details that match your Business Profile.',
      whatToDo:
        'Add a complete business address, customer service email, and phone number to the contact page footer and header. Ensure details match Google Business Profile and Merchant Center business information.',
      evidence: {
        'Page crawled': '/pages/contact',
        'Address visible': 'false',
        'Phone visible': 'false',
        'Email visible': 'true',
      },
      steps: [
        'Open Shopify Admin → Online Store → Pages → Contact.',
        'Add structured address block with street, city, postal code, country.',
        'Add click-to-call phone number in header and footer.',
        'Republish and verify on mobile and desktop.',
      ],
    },
    {
      id: 'f2',
      number: 2,
      severity: 'critical',
      category: 'Policies',
      ruleId: 'SQ-004',
      confidence: 0.88,
      title: 'Return policy page missing required refund timeline',
      affectedUrl: 'https://www.example-store.com/policies/refund-policy',
      whatWeFound:
        'The return policy mentions returns are accepted but does not specify the number of days customers have to return items or how refunds are processed.',
      whatToDo:
        'Publish a return policy that states the return window (e.g. 30 days), condition requirements, refund method, and processing time.',
      evidence: {
        'Return window stated': 'false',
        'Refund method stated': 'partial',
        'Policy link in footer': 'true',
      },
      steps: [
        'Edit Refund Policy in Shopify Settings → Policies.',
        'Add explicit return window and refund processing timeline.',
        'Link policy from footer on all pages.',
      ],
    },
    {
      id: 'f3',
      number: 3,
      severity: 'high',
      category: 'Shipping',
      ruleId: 'SQ-007',
      confidence: 0.81,
      title: 'Shipping costs not clearly disclosed before checkout',
      affectedUrl: 'https://www.example-store.com/products/sample-product',
      whatWeFound:
        'Product pages show free shipping messaging in the hero banner but shipping costs vary by region and are only visible at checkout.',
      whatToDo:
        'Display shipping cost estimates or thresholds on product pages and cart. Align on-site shipping messaging with Merchant Center shipping settings.',
      evidence: {
        'Shipping on PDP': 'missing',
        'Free shipping banner': 'true',
        'MC shipping setting': 'flat rate',
      },
      steps: [
        'Add shipping calculator or flat-rate table to product template.',
        'Update banner copy to match actual shipping rules.',
        'Sync shipping settings in Merchant Center.',
      ],
    },
    {
      id: 'f4',
      number: 4,
      severity: 'high',
      category: 'Products',
      ruleId: 'SQ-011',
      confidence: 0.79,
      title: 'Structured product data missing availability on several SKUs',
      affectedUrl: 'https://www.example-store.com/collections/all',
      whatWeFound:
        'JSON-LD Product schema on 6 of 20 sampled products omits the availability field, which can cause mismatches with Merchant Center feed status.',
      whatToDo:
        'Ensure all product templates output schema.org availability (InStock / OutOfStock) matching inventory levels.',
      evidence: {
        'Products sampled': '20',
        'Missing availability': '6',
        'Schema type': 'Product',
      },
      steps: [
        'Audit theme product JSON-LD snippet.',
        'Map inventory status to schema.org availability values.',
        'Validate with Google Rich Results Test.',
      ],
    },
    {
      id: 'f5',
      number: 5,
      severity: 'medium',
      category: 'Trust signals',
      ruleId: 'SQ-015',
      confidence: 0.74,
      title: 'About page lacks verifiable business history',
      affectedUrl: 'https://www.example-store.com/pages/about-us',
      whatWeFound:
        'The about page uses generic marketing copy without company registration details, founding year, or physical presence indicators.',
      whatToDo:
        'Expand the about page with verifiable business identity signals: legal name, registration number where applicable, and team or location context.',
      evidence: {
        'Legal entity name': 'missing',
        'Founding year': 'missing',
        'Physical presence': 'vague',
      },
      steps: [
        'Add legal business name and registration info.',
        'Include photos of warehouse or team if available.',
        'Cross-check with Merchant Center business information.',
      ],
    },
    {
      id: 'f6',
      number: 6,
      severity: 'low',
      category: 'SEO / Quality',
      ruleId: 'SQ-018',
      confidence: 0.66,
      title: 'Duplicate meta descriptions on category pages',
      affectedUrl: 'https://www.example-store.com/collections/shoes',
      whatWeFound:
        'Three category pages share identical meta descriptions, reducing page uniqueness signals.',
      whatToDo: 'Write unique meta descriptions per collection reflecting category-specific inventory.',
      evidence: {
        'Duplicate groups': '3',
        'Pages affected': '9',
      },
      steps: [
        'Export collection SEO fields from Shopify.',
        'Rewrite unique descriptions per category.',
        'Republish and recrawl.',
      ],
    },
  ],
};
