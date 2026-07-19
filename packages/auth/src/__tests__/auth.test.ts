import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, isValidPassword } from '../password';
import { SESSION_COOKIE_NAME, buildSessionCookieOptions } from '../session';

describe('password auth', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('secret-pass-123');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('secret-pass-123', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('validates minimum length', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('longenough')).toBe(true);
  });

  it('exports session cookie helpers', () => {
    expect(SESSION_COOKIE_NAME).toBe('sr_session');
    const options = buildSessionCookieOptions(new Date('2030-01-01T00:00:00.000Z'));
    expect(options.httpOnly).toBe(true);
  });
});
