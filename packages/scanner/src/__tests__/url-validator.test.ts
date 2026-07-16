import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lookup } from 'node:dns/promises';
import {
  validateUrlFormat,
  validateUrlSafe,
  validateRedirectUrl,
  validateRedirectUrlSafe,
  validateRedirectChain,
} from '../url-validator.js';

vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(),
}));

const mockedLookup = vi.mocked(lookup);

describe('validateUrlFormat', () => {
  it('accepts valid https URLs', () => {
    const result = validateUrlFormat('https://shop.example.com/products');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.hostname).toBe('shop.example.com');
    }
  });

  it('accepts valid http URLs', () => {
    expect(validateUrlFormat('http://example.com').valid).toBe(true);
  });

  it('rejects empty URLs', () => {
    expect(validateUrlFormat('').valid).toBe(false);
  });

  it('rejects non-http(s) schemes', () => {
    const result = validateUrlFormat('ftp://example.com');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('HTTP and HTTPS');
    }
  });

  it('rejects file scheme', () => {
    expect(validateUrlFormat('file:///etc/passwd').valid).toBe(false);
  });

  it('rejects javascript scheme', () => {
    expect(validateUrlFormat('javascript:alert(1)').valid).toBe(false);
  });

  it('rejects localhost hostname', () => {
    const result = validateUrlFormat('http://localhost/admin');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('Blocked hostname');
    }
  });

  it('rejects localhost subdomains', () => {
    expect(validateUrlFormat('http://app.localhost').valid).toBe(false);
  });

  it('rejects .local hostnames', () => {
    expect(validateUrlFormat('http://printer.local').valid).toBe(false);
  });

  it('rejects private IPv4 addresses', () => {
    expect(validateUrlFormat('http://10.0.0.1').valid).toBe(false);
    expect(validateUrlFormat('http://172.16.0.1').valid).toBe(false);
    expect(validateUrlFormat('http://192.168.1.1').valid).toBe(false);
    expect(validateUrlFormat('http://127.0.0.1').valid).toBe(false);
    expect(validateUrlFormat('http://0.0.0.0').valid).toBe(false);
  });

  it('rejects link-local and metadata IPv4', () => {
    expect(validateUrlFormat('http://169.254.169.254/latest/meta-data').valid).toBe(false);
  });

  it('rejects IPv6 localhost and link-local', () => {
    expect(validateUrlFormat('http://[::1]').valid).toBe(false);
    expect(validateUrlFormat('http://[fe80::1]').valid).toBe(false);
  });

  it('rejects URLs with embedded credentials', () => {
    expect(validateUrlFormat('http://user:pass@example.com').valid).toBe(false);
  });

  it('rejects metadata hostnames', () => {
    expect(validateUrlFormat('http://metadata.google.internal').valid).toBe(false);
  });
});

describe('validateUrlSafe', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('accepts public hostnames that resolve to public IPs', async () => {
    mockedLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);

    const result = await validateUrlSafe('https://example.com');
    expect(result.valid).toBe(true);
    expect(mockedLookup).toHaveBeenCalledWith('example.com', { all: true });
  });

  it('rejects hostnames that resolve to private IPs', async () => {
    mockedLookup.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);

    const result = await validateUrlSafe('https://evil.example.com');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('private or restricted IP');
    }
  });

  it('rejects hostnames that resolve to metadata IP', async () => {
    mockedLookup.mockResolvedValue([{ address: '169.254.169.254', family: 4 }]);

    const result = await validateUrlSafe('https://metadata.example.com');
    expect(result.valid).toBe(false);
  });

  it('rejects unresolvable hostnames', async () => {
    mockedLookup.mockRejectedValue(new Error('ENOTFOUND'));

    const result = await validateUrlSafe('https://does-not-exist.invalid');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('Unable to resolve');
    }
  });

  it('skips DNS lookup for literal public IPs', async () => {
    const result = await validateUrlSafe('https://93.184.216.34');
    expect(result.valid).toBe(true);
    expect(mockedLookup).not.toHaveBeenCalled();
  });
});

describe('redirect re-validation', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
    mockedLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  });

  it('validates redirect URLs with format checks', () => {
    expect(validateRedirectUrl('https://example.com/next', 1).valid).toBe(true);
    expect(validateRedirectUrl('http://127.0.0.1', 1).valid).toBe(false);
  });

  it('rejects redirect chains exceeding max redirects', () => {
    const result = validateRedirectUrl('https://example.com', 6);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('Maximum redirect limit');
    }
  });

  it('re-validates redirect URLs with DNS resolution', async () => {
    const result = await validateRedirectUrlSafe('https://example.com/redirect', 2);
    expect(result.valid).toBe(true);
    expect(mockedLookup).toHaveBeenCalled();
  });

  it('rejects unsafe redirect targets in chain', async () => {
    const initial = await validateRedirectChain('https://example.com', [
      'https://safe.example.com',
      'http://169.254.169.254',
    ]);

    expect(initial.valid).toBe(false);
  });

  it('accepts a safe redirect chain', async () => {
    const result = await validateRedirectChain('https://example.com', [
      'https://example.com/page',
      'https://example.com/final',
    ]);

    expect(result.valid).toBe(true);
  });

  it('rejects chains longer than max redirects', async () => {
    const redirects = Array.from({ length: 6 }, (_, i) => `https://example.com/r${i}`);
    const result = await validateRedirectChain('https://example.com', redirects);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('Maximum redirect limit');
    }
  });
});
