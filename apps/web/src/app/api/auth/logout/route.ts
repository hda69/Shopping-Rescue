import { loadEnv } from '@shopping-rescue/shared/load-env';
import { SESSION_COOKIE_NAME, deleteSessionByToken } from '@shopping-rescue/auth';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { getAppBaseUrl } from '@/lib/app-url';
import { NextResponse } from 'next/server';

loadEnv();

export async function POST(request: Request) {
  const url = new URL(request.url);
  const locale = parseLocaleParam(url.searchParams.get('locale'));
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (match) {
    const raw = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
    await deleteSessionByToken(raw);
  }

  const response = NextResponse.redirect(
    new URL(localizePath('/login', locale), getAppBaseUrl(request)),
    303,
  );
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
