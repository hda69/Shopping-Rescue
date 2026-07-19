import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  SESSION_COOKIE_NAME,
  buildSessionCookieOptions,
  getUserByEmail,
  createUserWithPassword,
  setUserPasswordHash,
  linkUserToOrganizationsByEmail,
  establishSession,
  hashPassword,
  verifyPassword,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
} from '@shopping-rescue/auth';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { getAppBaseUrl } from '@/lib/app-url';
import { NextResponse } from 'next/server';

loadEnv();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setSessionCookie(response: NextResponse, rawToken: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, rawToken, buildSessionCookieOptions(expiresAt));
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; locale?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const locale = parseLocaleParam(body.locale);
  const mode = body.mode === 'signup' ? 'signup' : 'login';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: 'weak_password', minLength: MIN_PASSWORD_LENGTH },
      { status: 400 },
    );
  }

  if (mode === 'signup') {
    const existing = await getUserByEmail(email);
    if (existing?.passwordHash) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = existing
      ? (await setUserPasswordHash(existing.id, passwordHash))!
      : await createUserWithPassword({ email, passwordHash, locale });

    await linkUserToOrganizationsByEmail(user.id, user.email);
    const session = await establishSession(user.id);
    const response = NextResponse.json({
      ok: true,
      redirect: localizePath('/dashboard', locale),
    });
    setSessionCookie(response, session.rawToken, session.expiresAt);
    return response;
  }

  const user = await getUserByEmail(email);
  if (!user?.passwordHash) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  await linkUserToOrganizationsByEmail(user.id, user.email);
  const session = await establishSession(user.id);
  const response = NextResponse.json({
    ok: true,
    redirect: localizePath('/dashboard', locale),
  });
  setSessionCookie(response, session.rawToken, session.expiresAt);
  return response;
}
