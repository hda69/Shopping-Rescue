/**
 * Public site origin for redirects and absolute URLs.
 * Never use request.url alone on Railway — the container host is often 0.0.0.0:PORT.
 */
export function getAppBaseUrl(request?: Request): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
  ];

  for (const raw of candidates) {
    const value = raw?.trim().replace(/\/$/, '');
    if (value && !isUnusableHost(value)) {
      return value;
    }
  }

  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost ?? request.headers.get('host');
    const proto =
      request.headers.get('x-forwarded-proto') ??
      (host?.includes('localhost') ? 'http' : 'https');

    if (host && !isUnusableHost(host)) {
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  // Production must never advertise localhost (breaks Search Console sitemaps).
  if (process.env.NODE_ENV === 'production') {
    return 'https://shoppingrescue.app';
  }

  return 'http://localhost:3000';
}

function isUnusableHost(value: string): boolean {
  return /localhost|0\.0\.0\.0|127\.0\.0\.1(?::\d+)?$|\[::\]/.test(value);
}

export function appUrl(path: string, request?: Request): URL {
  const base = getAppBaseUrl(request);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, `${base}/`);
}
