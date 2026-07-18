import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  type AuthSession,
  getSessionByToken,
  deleteSessionByToken,
  createSession,
} from './session.js';

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return getSessionByToken(raw);
}

export async function getSession(request?: Request): Promise<AuthSession | null> {
  if (request) {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (!match) return null;
    const raw = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
    return getSessionByToken(raw);
  }
  return getSessionFromCookies();
}

export async function establishSession(userId: string): Promise<{
  rawToken: string;
  expiresAt: Date;
}> {
  const session = await createSession(userId);
  return { rawToken: session.rawToken, expiresAt: session.expiresAt };
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (raw) {
    await deleteSessionByToken(raw);
  }
  jar.delete(SESSION_COOKIE_NAME);
}
