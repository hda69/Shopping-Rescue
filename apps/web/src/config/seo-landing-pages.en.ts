import type { SeoLandingPageConfig } from './seo-landing-pages';

export const SEO_LANDING_PAGES_EN: Record<string, SeoLandingPageConfig> = {
  'merchant-center-suspended': {
    slug: 'merchant-center-suspended',
    metaTitle: 'Google Merchant Center Suspended — Diagnose Likely Causes',
    metaDescription:
      'Independent diagnostics for suspended Google Merchant Center accounts. Crawl your storefront, surface policy gaps, and get evidence-based remediation steps.',
    keywords: [
      'merchant center suspended',
      'google merchant center suspension',
      'account suspended google shopping',
      'reinstate merchant center',
    ],
    eyebrow: 'Account suspension',
    headline: 'Merchant Center suspended? Start with evidence, not guesswork.',
    subheadline:
      'Google rarely explains the exact trigger. Shopping Rescue analyzes your public storefront against common suspension patterns and returns prioritized findings.',
    issuePrefill: 'suspension',
    intro:
      'A suspension blocks your products from Google Shopping and often affects free listings. Before submitting another review request, merchants need a clear picture of what on the site or feed may conflict with Google policies.',
    whatItMeans:
      'A suspended Merchant Center account means Google has restricted your ability to serve Shopping ads or listings. Causes are often linked to business transparency, policy pages, product data quality, or inconsistencies between your site and Merchant Center — not a single broken setting.',
    commonCauses: [
      'Missing or hard-to-find refund, shipping, or privacy policies',
      'Business identity gaps — no About page, weak contact details, or unclear legal entity',
      'Product landing pages that differ from feed data (price, availability, title)',
      'Trust signals blocked by robots.txt or poor site quality',
      'Repeated review submissions without fixing underlying site issues',
    ],
    checks: [
      'Policy pages: shipping, returns, privacy, terms, and contact',
      'Business identity: About page, organization schema, visible contact methods',
      'Product structured data: price, availability, images, and identifiers',
      'Site quality: HTTPS, performance, homepage metadata, and crawlability',
      'Robots.txt and sitemap coverage for key storefront URLs',
    ],
    faq: [
      {
        question: 'Can Shopping Rescue reinstate my Merchant Center account?',
        answer:
          'No. We provide independent diagnostics and remediation guidance. Reinstatement decisions are made solely by Google.',
      },
      {
        question: 'Do I need to connect my Google account?',
        answer:
          'No for the free scan. We analyze your public storefront. A paid Merchant Center connection is optional for deeper sync on monitoring plans.',
      },
      {
        question: 'How fast will I get results?',
        answer:
          'Most free scans complete within a few minutes. You receive a risk score and sample findings before upgrading to the full audit.',
      },
    ],
    relatedSlugs: [
      'merchant-center-misrepresentation',
      'website-needs-improvement',
      'product-disapprovals',
    ],
  },
  'merchant-center-misrepresentation': {
    slug: 'merchant-center-misrepresentation',
    metaTitle: 'Merchant Center Misrepresentation — Fix Trust & Identity Issues',
    metaDescription:
      'Diagnose misrepresentation warnings in Google Merchant Center. Check business identity, policies, contact transparency, and storefront consistency.',
    keywords: [
      'merchant center misrepresentation',
      'google misrepresentation policy',
      'unacceptable business practices',
      'merchant center trust issues',
    ],
    eyebrow: 'Misrepresentation',
    headline: 'Misrepresentation warning? Audit how your business appears online.',
    subheadline:
      'Google expects your storefront to honestly represent who you are, what you sell, and how customers can reach you. We flag gaps that commonly trigger misrepresentation reviews.',
    issuePrefill: 'misrepresentation',
    intro:
      'Misrepresentation issues often stem from missing trust signals rather than malicious intent. Merchants frequently receive this warning when contact details, legal policies, or business identity are incomplete or inconsistent across the site.',
    whatItMeans:
      'Misrepresentation means Google believes your store may mislead shoppers about your business, products, or policies. It is a policy enforcement category — fixing visible transparency issues on your site is usually the first step before requesting review.',
    commonCauses: [
      'No clear business name, address, or customer support channel',
      'Generic homepage title or missing organization structured data',
      'Refund and shipping policies absent, thin, or contradictory',
      'Product claims on landing pages that do not match Merchant Center data',
      'Checkout or contact flows that hide how to reach the seller',
    ],
    checks: [
      'Contact page and visible email or phone on key pages',
      'About page presence and business identity signals',
      'Organization / LocalBusiness JSON-LD on the homepage',
      'Policy completeness and minimum content depth',
      'Cross-checks between product pages and structured data fields',
    ],
    faq: [
      {
        question: 'Is misrepresentation the same as a full suspension?',
        answer:
          'Not always. It can appear as a warning or account-level issue depending on severity. Both require fixing underlying trust problems on your storefront.',
      },
      {
        question: 'What should I fix first?',
        answer:
          'Start with contact transparency, legal policies, and business identity pages. These are the most common misrepresentation drivers our rules engine detects.',
      },
      {
        question: 'Will a scan guarantee the warning is removed?',
        answer:
          'No. We highlight probable causes with evidence. Google makes all enforcement and reinstatement decisions independently.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'website-needs-improvement',
      'shopify-merchant-center',
    ],
  },
  'website-needs-improvement': {
    slug: 'website-needs-improvement',
    metaTitle: 'Website Needs Improvement — Merchant Center Quality Audit',
    metaDescription:
      'Fix "Website needs improvement" warnings in Google Merchant Center. Audit policies, trust pages, performance, HTTPS, and crawlability on your storefront.',
    keywords: [
      'website needs improvement',
      'merchant center website quality',
      'google shopping website warning',
      'storefront trust audit',
    ],
    eyebrow: 'Website quality',
    headline: '"Website needs improvement" — see what Google likely expects you to fix.',
    subheadline:
      'This warning points to storefront quality and transparency problems. Shopping Rescue crawls your site and scores issues that commonly block approval.',
    issuePrefill: 'website_improvement',
    intro:
      'When Google flags website quality, merchants often focus on Merchant Center settings while the real blockers live on the storefront: broken policy pages, slow load times, missing HTTPS, or pages blocked from crawling.',
    whatItMeans:
      "Website needs improvement indicates your domain does not yet meet Google's expectations for a trustworthy shopping experience. It is frequently issued alongside thin policy content, poor navigation to legal pages, or technical barriers that prevent Google from verifying your store.",
    commonCauses: [
      'Shipping, returns, or privacy policies missing or under 200 characters',
      'Homepage slow to load or missing descriptive title and meta description',
      'Mixed HTTP resources on HTTPS pages',
      'Important URLs disallowed in robots.txt',
      'No XML sitemap or weak internal linking to policy pages',
    ],
    checks: [
      'Policy page depth and accessibility from the homepage',
      'HTTPS usage and mixed-content signals',
      'Homepage performance and SEO metadata quality',
      'Robots.txt rules affecting products, collections, or policies',
      'Sitemap.xml presence and discoverability',
    ],
    faq: [
      {
        question: 'Do I need to redesign my entire site?',
        answer:
          'Usually not. Most fixes are targeted: publish complete policies, improve contact transparency, fix crawl blocks, and align product pages with your feed.',
      },
      {
        question: 'How many pages does the free scan cover?',
        answer:
          'The free scan crawls up to 15 pages and 20 products — enough to surface high-impact issues. The full audit expands to 150 pages.',
      },
      {
        question: 'Can I re-scan after making fixes?',
        answer:
          'Yes. Full Audit includes a free re-scan so you can verify improvements before submitting another Google review request.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'merchant-center-misrepresentation',
      'product-disapprovals',
    ],
  },
  'product-disapprovals': {
    slug: 'product-disapprovals',
    metaTitle: 'Google Shopping Product Disapprovals — Feed & Landing Page Audit',
    metaDescription:
      'Find why Google Shopping products are disapproved. Check structured data, identifiers, availability, images, and landing page mismatches automatically.',
    keywords: [
      'google shopping product disapproved',
      'merchant center product disapproval',
      'product feed errors',
      'gtin mpn missing google shopping',
    ],
    eyebrow: 'Product disapprovals',
    headline: 'Products disapproved in Merchant Center? Compare your site to your feed.',
    subheadline:
      'Disapprovals often come from landing page mismatches or incomplete product data. We inspect public product pages and structured data for common failure patterns.',
    issuePrefill: 'product_disapproval',
    intro:
      'A disapproved product still hurts catalog health and can contribute to broader account issues. The fix is usually on the product URL Google crawls — not only inside the Merchant Center UI.',
    whatItMeans:
      'Product disapproval means Google will not show that item in Shopping results. Reasons include policy violations, missing identifiers, unavailable checkout, or differences between the feed and what appears on the live product page.',
    commonCauses: [
      'Price or availability on the page does not match the feed',
      'Missing GTIN, MPN, or brand in structured data',
      'Product JSON-LD without image or availability fields',
      'Landing page returns errors or blocks crawlers',
      'Policy-sensitive categories without required disclosures',
    ],
    checks: [
      'Product schema: name, image, price, currency, availability',
      'Identifier fields where applicable (GTIN, MPN, SKU)',
      'Crawl access to product and collection URLs',
      'Visible add-to-cart or buy path on sample products',
      'Consistency between HTML content and JSON-LD offers',
    ],
    faq: [
      {
        question: 'Does the scan access my Merchant Center product list?',
        answer:
          'The free scan analyzes your public storefront only. Monitoring plans can connect Merchant Center via OAuth to compare feed status with live pages.',
      },
      {
        question: 'How many products are analyzed on the free plan?',
        answer:
          'Up to 20 products on the free scan, with detailed findings on the top issues detected.',
      },
      {
        question: 'Can one disapproved product suspend my account?',
        answer:
          'A single disapproval usually is not enough, but patterns across many products or policy violations can escalate to account-level enforcement.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'shopify-merchant-center',
      'website-needs-improvement',
    ],
  },
  'shopify-merchant-center': {
    slug: 'shopify-merchant-center',
    metaTitle: 'Shopify Google Merchant Center Issues — Automated Store Audit',
    metaDescription:
      'Shopify store blocked in Google Merchant Center? Audit policies, product structured data, sitemaps, and trust pages with an automated crawl built for Shopify storefronts.',
    keywords: [
      'shopify merchant center suspended',
      'shopify google shopping issues',
      'shopify product disapproved',
      'shopify merchant center audit',
    ],
    eyebrow: 'Shopify + Merchant Center',
    headline: 'Shopify + Merchant Center issues? Audit your theme and public pages.',
    subheadline:
      'Most Shopify suspension and disapproval fixes happen in theme pages, policy templates, and product structured data — not in the Google Ads UI alone.',
    issuePrefill: 'none',
    platformPrefill: 'shopify',
    intro:
      'Shopify merchants often connect Google Merchant Center through Google & YouTube or a feed app. When issues appear, the root cause is frequently an incomplete policy page, theme SEO settings, or product data on the live storefront.',
    whatItMeans:
      'Shopify simplifies ecommerce, but Google still evaluates your public domain independently. Policy pages must be reachable, product JSON-LD must be accurate, and your sitemap should expose products and collections to crawlers.',
    commonCauses: [
      'Default Shopify policy pages not customized or linked in the footer',
      'Homepage SEO title still set to store name only',
      'Product structured data missing availability during stock transitions',
      'Robots or app settings blocking Google from product URLs',
      'Feed app overrides that drift from on-site price or sale badges',
    ],
    checks: [
      'Shopify policy routes: /policies/shipping-policy, returns, privacy, terms',
      'Theme-level organization schema and contact page',
      'Product and collection URLs via sitemap discovery',
      'JSON-LD on product templates (price, image, availability)',
      'Footer navigation to legal and contact pages',
    ],
    faq: [
      {
        question: 'Do you need access to my Shopify admin?',
        answer:
          'No. We only crawl publicly accessible pages, the same way Google does. No passwords or admin API keys are required.',
      },
      {
        question: 'Is this only for suspended stores?',
        answer:
          'No. Use it for preventive audits before connecting Merchant Center, or after product disapprovals and website quality warnings.',
      },
      {
        question: 'Does Shopify automatically fix Merchant Center issues?',
        answer:
          'Shopify provides sitemaps and themes, but policies, business identity content, and feed alignment remain the merchant\'s responsibility.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'product-disapprovals',
      'website-needs-improvement',
    ],
  },
};
