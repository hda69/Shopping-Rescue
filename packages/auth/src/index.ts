export {
  SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
} from './constants';

export {
  type AuthSession,
  buildSessionCookieOptions,
  createLoginToken,
  consumeLoginToken,
  upsertUserByEmail,
  linkUserToOrganizationsByEmail,
  ensureUserMembershipForOrganization,
  createSession,
  getSessionByToken,
  deleteSessionByToken,
} from './session';

export {
  getSession,
  getSessionFromCookies,
  establishSession,
  clearSessionCookie,
} from './cookies';