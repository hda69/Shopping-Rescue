import { describe, it, expect } from 'vitest';
import { normalizeUrl, isValidUrl } from '../validation/index.js';
import { calculateRiskScore } from '../utils/scoring.js';
import { encrypt, decrypt } from '../utils/crypto.js';

describe('normalizeUrl', () => {
  it('adds https if missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('removes trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  it('removes tracking params', () => {
    expect(normalizeUrl('https://example.com?utm_source=google&page=1')).toBe(
      'https://example.com?page=1',
    );
  });

  it('rejects non-http schemes', () => {
    expect(() => normalizeUrl('ftp://example.com')).toThrow();
  });
});

describe('isValidUrl', () => {
  it('accepts valid URLs', () => {
    expect(isValidUrl('https://shop.example.com')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(isValidUrl('')).toBe(false);
  });
});

describe('calculateRiskScore', () => {
  it('calculates weighted score', () => {
    const score = calculateRiskScore([
      { ruleId: 'BI-001', severity: 'critical' },
      { ruleId: 'SQ-001', severity: 'high' },
    ]);
    expect(score).toBe(30);
  });

  it('caps score at 100', () => {
    const findings = Array.from({ length: 20 }, (_, i) => ({
      ruleId: `R-${i}`,
      severity: 'critical' as const,
    }));
    expect(calculateRiskScore(findings)).toBe(100);
  });

  it('caps per-rule contribution', () => {
    const score = calculateRiskScore([
      { ruleId: 'PR-001', severity: 'critical', count: 100 },
    ]);
    expect(score).toBe(40);
  });
});

describe('encryption', () => {
  const testKey = Buffer.alloc(32, 'a').toString('base64');

  it('encrypts and decrypts round-trip', () => {
    const plaintext = 'refresh_token_abc123';
    const encrypted = encrypt(plaintext, testKey);
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted, testKey)).toBe(plaintext);
  });
});
