import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  SESSION_COOKIE_NAME,
  buildSessionCookieOptions,
  consumeLoginToken,
  upsertUserByEmail,
  linkUserToOrganizationsByEmail,
  establishSession,
} from '@shopping-rescue/auth';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { getAppBaseUrl } from '@/lib/app-url';
import { NextResponse } from 'next/server';

loadEnv();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const localeHint = parseLocaleParam(url.searchParams.get('locale'));

  if (!token) {
    return NextResponse.redirect(
      new URL(`${localizePath('/login', localeHint)}?error=missing_token`, getAppBaseUrl(request)),
      303,
    );
  }

  const consumed = await consumeLoginToken(token);
  if (!consumed) {
    return NextResponse.redirect(
      new URL(`${localizePath('/login', localeHint)}?error=invalid_token`, getAppBaseUrl(request)),
      303,
    );
  }

  const locale = consumed.locale || localeHint;
  const user = await upsertUserByEmail({ email: consumed.email, locale });
  await linkUserToOrganizationsByEmail(user.id, user.email);
  const session = await establishSession(user.id);

  const response = NextResponse.redirect(
    new URL(localizePath('/dashboard', locale), getAppBaseUrl(request)),
    303,
  );
  response.cookies.set(
    SESSION_COOKIE_NAME,
    session.rawToken,
    buildSessionCookieOptions(session.expiresAt),
  );
  return response;
}
