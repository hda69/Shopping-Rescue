import { z } from 'zod';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  '_ga',
  'ref',
]);

export function normalizeUrl(input: string): string {
  let url = input.trim();

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  const parsed = new URL(url);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  parsed.hash = '';

  const paramsToDelete: string[] = [];
  parsed.searchParams.forEach((_, key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      paramsToDelete.push(key);
    }
  });
  paramsToDelete.forEach((key) => parsed.searchParams.delete(key));

  let result = parsed.origin;

  let pathname = parsed.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname !== '/') {
    result += pathname;
  }

  if (parsed.search) {
    result += parsed.search;
  }

  return result;
}

export function isValidUrl(input: string): boolean {
  try {
    normalizeUrl(input);
    return true;
  } catch {
    return false;
  }
}

export const freeScanSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(isValidUrl, 'Please enter a valid website URL'),
  email: z.string().email('Please enter a valid email address'),
  platform: z.enum(['shopify', 'woocommerce', 'magento', 'prestashop', 'custom', 'unknown']),
  country: z.string().length(2, 'Please select a country'),
  mcIssueType: z.enum([
    'suspension',
    'misrepresentation',
    'website_improvement',
    'product_disapproval',
    'other',
    'none',
  ]),
  reviewRequests: z.number().int().min(0).max(10).default(0),
  locale: z.enum(['en', 'fr']).optional().default('en'),
});

export type FreeScanInput = z.infer<typeof freeScanSchema>;
