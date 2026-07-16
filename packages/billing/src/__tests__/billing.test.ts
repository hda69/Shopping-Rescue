import { describe, it, expect } from 'vitest';
import { verifyStripeWebhook } from '../webhooks';

describe('verifyStripeWebhook', () => {
  it('returns unverified for invalid signature', () => {
    const result = verifyStripeWebhook('{}', 'invalid-signature', 'whsec_test');
    expect(result.verified).toBe(false);
    expect(result.error).toBeDefined();
  });
});
