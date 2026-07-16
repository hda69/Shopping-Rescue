import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export interface UrlValidationError {
  valid: false;
  reason: string;
}

export interface UrlValidationSuccess {
  valid: true;
  url: URL;
  hostname: string;
}

export type UrlValidationResult = UrlValidationError | UrlValidationSuccess;

export interface RedirectValidationOptions {
  maxRedirects?: number;
}

const DEFAULT_MAX_REDIRECTS = 5;

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }

  const a = parts[0]!;
  const b = parts[1]!;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  return false;
}

function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  if (BLOCKED_HOSTNAMES.has(normalized)) return true;
  if (normalized.endsWith('.localhost')) return true;
  if (normalized.endsWith('.local')) return true;
  if (normalized.endsWith('.internal')) return true;

  return false;
}

function normalizeHostname(hostname: string): string {
  const trimmed = hostname.toLowerCase().replace(/\.$/, '');
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function validateUrlFormat(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, reason: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs with credentials are not allowed' };
  }

  const hostname = normalizeHostname(parsed.hostname);

  if (isBlockedHostname(hostname)) {
    return { valid: false, reason: 'Blocked hostname' };
  }

  const ipVersion = isIP(hostname);
  if (ipVersion !== 0) {
    if (isBlockedIp(hostname)) {
      return { valid: false, reason: 'Private or restricted IP address' };
    }
  }

  return { valid: true, url: parsed, hostname };
}

export async function validateUrlSafe(input: string): Promise<UrlValidationResult> {
  const formatResult = validateUrlFormat(input);
  if (!formatResult.valid) {
    return formatResult;
  }

  const { hostname } = formatResult;

  if (isIP(hostname) !== 0) {
    return formatResult;
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    if (addresses.length === 0) {
      return { valid: false, reason: 'Unable to resolve hostname' };
    }

    for (const { address } of addresses) {
      if (isBlockedIp(address)) {
        return { valid: false, reason: 'Hostname resolves to private or restricted IP' };
      }
    }

    return formatResult;
  } catch {
    return { valid: false, reason: 'Unable to resolve hostname' };
  }
}

export function validateRedirectUrl(
  redirectUrl: string,
  redirectCount: number,
  options: RedirectValidationOptions = {},
): UrlValidationResult {
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  if (redirectCount > maxRedirects) {
    return {
      valid: false,
      reason: `Maximum redirect limit (${maxRedirects}) exceeded`,
    };
  }

  return validateUrlFormat(redirectUrl);
}

export async function validateRedirectUrlSafe(
  redirectUrl: string,
  redirectCount: number,
  options: RedirectValidationOptions = {},
): Promise<UrlValidationResult> {
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  if (redirectCount > maxRedirects) {
    return {
      valid: false,
      reason: `Maximum redirect limit (${maxRedirects}) exceeded`,
    };
  }

  return validateUrlSafe(redirectUrl);
}

export async function validateRedirectChain(
  initialUrl: string,
  redirectUrls: string[],
  options: RedirectValidationOptions = {},
): Promise<UrlValidationResult> {
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  const initial = await validateUrlSafe(initialUrl);
  if (!initial.valid) {
    return initial;
  }

  if (redirectUrls.length > maxRedirects) {
    return {
      valid: false,
      reason: `Maximum redirect limit (${maxRedirects}) exceeded`,
    };
  }

  let lastResult: UrlValidationSuccess = initial;

  for (let index = 0; index < redirectUrls.length; index++) {
    const redirectResult = await validateRedirectUrlSafe(redirectUrls[index]!, index + 1, options);
    if (!redirectResult.valid) {
      return redirectResult;
    }
    lastResult = redirectResult;
  }

  return lastResult;
}
