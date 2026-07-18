import { loadEnv } from '@shopping-rescue/shared/load-env';
import { getSession, OAUTH_STATE_COOKIE_NAME } from '@shopping-rescue/auth';
import {
  exchangeGoogleAuthCode,
  createMerchantApiClient,
} from '@shopping-rescue/merchant-api';
import {
  saveMerchantConnection,
  upsertMerchantAccounts,
  enqueueMerchantSync,
} from '@shopping-rescue/database';
import { getAppBaseUrl } from '@/lib/app-url';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { NextResponse } from 'next/server';

loadEnv();

export async function GET(request: Request) {
  const session = await getSession(request);
  const url = new URL(request.url);
  const localeHint = parseLocaleParam(url.searchParams.get('locale'));

  if (!session) {
    return NextResponse.redirect(
      new URL(localizePath('/login', localeHint), getAppBaseUrl(request)),
      303,
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_STATE_COOKIE_NAME}=`));

  if (!code || !state || !match) {
    return NextResponse.redirect(
      new URL(
        `${localizePath('/dashboard/integrations', localeHint)}?error=oauth_state`,
        getAppBaseUrl(request),
      ),
      303,
    );
  }

  let payload: {
    state: string;
    verifier: string;
    organizationId: string;
    locale?: string;
  };
  try {
    payload = JSON.parse(decodeURIComponent(match.slice(OAUTH_STATE_COOKIE_NAME.length + 1)));
  } catch {
    return NextResponse.redirect(
      new URL(
        `${localizePath('/dashboard/integrations', localeHint)}?error=oauth_state`,
        getAppBaseUrl(request),
      ),
      303,
    );
  }

  const locale = parseLocaleParam(payload.locale ?? localeHint);
  if (payload.state !== state) {
    return NextResponse.redirect(
      new URL(
        `${localizePath('/dashboard/integrations', locale)}?error=oauth_state`,
        getAppBaseUrl(request),
      ),
      303,
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${getAppBaseUrl(request).replace(/\/$/, '')}/api/oauth/google/callback`;

  try {
    const tokens = await exchangeGoogleAuthCode({
      code,
      codeVerifier: payload.verifier,
      redirectUri,
    });

    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
    const connection = await saveMerchantConnection({
      organizationId: payload.organizationId,
      googleAccountEmail: tokens.email || session.email,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      tokenExpiresAt: expiresAt,
    });

    const client = createMerchantApiClient({ accessToken: tokens.accessToken });
    const accounts = await client.listAccounts();
    await upsertMerchantAccounts(
      connection.id,
      accounts.map((account) => ({
        id: account.id,
        name: account.name,
        accountType: account.accountType,
        raw: account,
      })),
    );

    await enqueueMerchantSync({
      organizationId: payload.organizationId,
      connectionId: connection.id,
    });

    const response = NextResponse.redirect(
      new URL(localizePath('/dashboard/integrations', locale), getAppBaseUrl(request)),
      303,
    );
    response.cookies.set(OAUTH_STATE_COOKIE_NAME, '', { path: '/', expires: new Date(0) });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'oauth_failed';
    return NextResponse.redirect(
      new URL(
        `${localizePath('/dashboard/integrations', locale)}?error=${encodeURIComponent(message.slice(0, 80))}`,
        getAppBaseUrl(request),
      ),
      303,
    );
  }
}
