import { describe, it, expect } from 'vitest';
import { createMerchantApiClient } from '../client.js';
import type { MerchantApiAdapter } from '../adapter.js';

describe('MerchantApiClient', () => {
  it('delegates to adapter when provided', async () => {
    const adapter: MerchantApiAdapter = {
      listAccounts: async () => [{ id: '123', name: 'Test Store' }],
      listProducts: async () => [],
      getAccountIssues: async () => [],
    };

    const client = createMerchantApiClient({ accessToken: 'token', adapter });
    const accounts = await client.listAccounts();

    expect(accounts).toEqual([{ id: '123', name: 'Test Store' }]);
  });
});
