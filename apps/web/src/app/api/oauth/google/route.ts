import { createHash, randomBytes } from 'crypto';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { getSession, OAUTH_STATE_COOKIE_NAME } from '@shopping-rescue/auth';
import { getGoogleOAuthAuthorizeUrl } from '@shopping-rescue/merchant-api';
import { getPrimaryOrganizationForUser } from '@shopping-rescue/database';
import { getAppBaseUrl } from '@/lib/app-url';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { NextResponse } from 'next/server';

loadEnv();

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

export async function GET(request: Request) {
  const session = await getSession(request);
  const url = new URL(request.url);
  const locale = parseLocaleParam(url.searchParams.get('locale'));

  if (!session) {
    return NextResponse.redirect(new URL(localizePath('/login', locale), getAppBaseUrl(request)), 303);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL(`${localizePath('/dashboard/integrations', locale)}?error=google_not_configured`, getAppBaseUrl(request)),
      303,
    );
  }

  const org = await getPrimaryOrganizationForUser(session.userId);
  if (!org || (org.plan !== 'monitoring_pro' && org.plan !== 'agency')) {
    return NextResponse.redirect(
      new URL(`${localizePath('/dashboard/integrations', locale)}?error=plan_required`, getAppBaseUrl(request)),
      303,
    );
  }

  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash('sha256').update(verifier).digest());
  const state = base64Url(randomBytes(24));
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${getAppBaseUrl(request).replace(/\/$/, '')}/api/oauth/google/callback`;

  const authorizeUrl = getGoogleOAuthAuthorizeUrl({
    state,
    codeChallenge: challenge,
    redirectUri,
  });

  const response = NextResponse.redirect(authorizeUrl, 303);
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    JSON.stringify({ state, verifier, organizationId: org.id, locale }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    },
  );
  return response;
}
