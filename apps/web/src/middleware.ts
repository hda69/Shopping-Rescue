import { SESSION_COOKIE_NAME } from '@shopping-rescue/auth/constants';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://accounts.google.com https://oauth2.googleapis.com https://merchantapi.googleapis.com",
  'frame-src https://js.stripe.com https://hooks.stripe.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function isDashboardPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/fr/dashboard' || pathname.startsWith('/fr/dashboard/');
}

function loginPathFor(pathname: string): string {
  return pathname.startsWith('/fr') ? '/fr/login' : '/login';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDashboardPath(pathname) && !request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPathFor(pathname);
    loginUrl.search = '';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
