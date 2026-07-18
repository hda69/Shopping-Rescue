import { SESSION_COOKIE_NAME, buildSessionCookieOptions } from '../session.js';
import { describe, it, expect } from 'vitest';

describe('auth package', () => {
  it('exports session cookie name', () => {
    expect(SESSION_COOKIE_NAME).toBe('sr_session');
  });

  it('builds httpOnly cookie options', () => {
    const expires = new Date('2030-01-01T00:00:00.000Z');
    const options = buildSessionCookieOptions(expires);
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe('/');
    expect(options.expires).toEqual(expires);
  });
});
