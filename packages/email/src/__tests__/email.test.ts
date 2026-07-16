import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isResendConfigured, getEmailConfigFromEnv } from '../config.js';
import { createEmailClient } from '../client.js';
import { buildScanCompletedEmail } from '../templates/scan-completed.js';
import { sendScanCompletedEmail } from '../send-scan-completed.js';

describe('isResendConfigured', () => {
  it('rejects missing and placeholder keys', () => {
    expect(isResendConfigured(undefined)).toBe(false);
    expect(isResendConfigured('')).toBe(false);
    expect(isResendConfigured('re_...')).toBe(false);
  });

  it('accepts real-looking Resend keys', () => {
    expect(isResendConfigured('re_123456789abcdefghij')).toBe(true);
  });
});

describe('getEmailConfigFromEnv', () => {
  it('returns null when env is incomplete', () => {
    expect(getEmailConfigFromEnv({ RESEND_API_KEY: 're_...' })).toBeNull();
    expect(
      getEmailConfigFromEnv({
        RESEND_API_KEY: 're_123456789abcdefghij',
      }),
    ).toBeNull();
  });

  it('returns config when env is valid', () => {
    const config = getEmailConfigFromEnv({
      RESEND_API_KEY: 're_123456789abcdefghij',
      RESEND_FROM_EMAIL: 'Shopping Rescue <nova.flow.app@gmail.com>',
    });

    expect(config).toEqual({
      apiKey: 're_123456789abcdefghij',
      fromAddress: 'Shopping Rescue <nova.flow.app@gmail.com>',
    });
  });
});

describe('buildScanCompletedEmail', () => {
  it('includes score and results link', () => {
    const email = buildScanCompletedEmail({
      siteUrl: 'https://shop.example.com',
      riskScore: 72,
      resultsUrl: 'http://localhost:3000/scan/abc',
      findingsCount: 8,
      pagesCrawled: 15,
    });

    expect(email.subject).toContain('72/100');
    expect(email.html).toContain('https://shop.example.com');
    expect(email.html).toContain('http://localhost:3000/scan/abc');
    expect(email.text).toContain('View results:');
  });
});

describe('createEmailClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('sends via Resend API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_123' }),
    });

    const client = createEmailClient({
      apiKey: 're_test_key',
      fromAddress: 'Shopping Rescue <nova.flow.app@gmail.com>',
    });

    const result = await client.send({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    expect(result.id).toBe('email_123');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('sendScanCompletedEmail', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('skips when Resend is not configured', async () => {
    const result = await sendScanCompletedEmail({
      to: 'user@example.com',
      scanId: 'scan-1',
      siteUrl: 'https://shop.example.com',
      riskScore: 40,
      findingsCount: 3,
      pagesCrawled: 10,
      env: { RESEND_API_KEY: 're_...' },
    });

    expect(result).toEqual({ sent: false, reason: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends when configured', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_456' }),
    });

    const result = await sendScanCompletedEmail({
      to: 'user@example.com',
      scanId: 'scan-1',
      siteUrl: 'https://shop.example.com',
      riskScore: 40,
      findingsCount: 3,
      pagesCrawled: 10,
      appUrl: 'http://localhost:3000',
      env: {
        RESEND_API_KEY: 're_123456789abcdefghij',
        RESEND_FROM_EMAIL: 'Shopping Rescue <nova.flow.app@gmail.com>',
      },
    });

    expect(result).toEqual({ sent: true, messageId: 'email_456' });
  });
});
