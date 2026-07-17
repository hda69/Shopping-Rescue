/**
 * Public site origin for redirects and absolute URLs.
 * Never use request.url alone on Railway — the container host is often 0.0.0.0:PORT.
 */
export function getAppBaseUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (fromEnv && !isUnusableHost(fromEnv)) {
    return fromEnv;
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

  return 'http://localhost:3000';
}

function isUnusableHost(value: string): boolean {
  return /0\.0\.0\.0|127\.0\.0\.1(?::\d+)?$|\[::\]/.test(value);
}

export function appUrl(path: string, request?: Request): URL {
  const base = getAppBaseUrl(request);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, `${base}/`);
}
