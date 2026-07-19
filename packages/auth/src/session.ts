export {
  SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
} from './constants';

export interface AuthSession {
  sessionId: string;
  userId: string;
  email: string;
  locale: string;
  expiresAt: Date;
}

export function buildSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

export {
  createLoginToken,
  consumeLoginToken,
  upsertUserByEmail,
  linkUserToOrganizationsByEmail,
  ensureUserMembershipForOrganization,
  createSession,
  getSessionByToken,
  deleteSessionByToken,
} from '@shopping-rescue/database';
