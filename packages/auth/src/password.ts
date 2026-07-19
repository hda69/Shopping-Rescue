import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;
const MIN_PASSWORD_LENGTH = 8;

export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algo, salt, hashHex] = passwordHash.split('$');
  if (algo !== 'scrypt' || !salt || !hashHex) return false;

  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const expected = Buffer.from(hashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function hashAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateAuthToken(): string {
  return randomBytes(32).toString('base64url');
}

export { MIN_PASSWORD_LENGTH };
