import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  SESSION_COOKIE_NAME,
  buildSessionCookieOptions,
  consumePasswordResetToken,
  getUserByEmail,
  setUserPasswordHash,
  createUserWithPassword,
  linkUserToOrganizationsByEmail,
  establishSession,
  hashPassword,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
} from '@shopping-rescue/auth';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { NextResponse } from 'next/server';

loadEnv();

export async function POST(request: Request) {
  let body: { token?: string; password?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const locale = parseLocaleParam(body.locale);

  if (!token) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }
  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: 'weak_password', minLength: MIN_PASSWORD_LENGTH },
      { status: 400 },
    );
  }

  const consumed = await consumePasswordResetToken(token);
  if (!consumed) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  let user = await getUserByEmail(consumed.email);
  if (!user) {
    user = await createUserWithPassword({
      email: consumed.email,
      passwordHash,
      locale: consumed.locale || locale,
    });
  } else {
    user = (await setUserPasswordHash(user.id, passwordHash))!;
  }

  await linkUserToOrganizationsByEmail(user.id, user.email);
  const session = await establishSession(user.id);
  const response = NextResponse.json({
    ok: true,
    redirect: localizePath('/dashboard', locale || consumed.locale),
  });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    session.rawToken,
    buildSessionCookieOptions(session.expiresAt),
  );
  return response;
}
