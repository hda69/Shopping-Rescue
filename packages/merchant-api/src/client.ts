import { createLogger } from '@shopping-rescue/shared';
import type { MerchantApiAdapter, MerchantAccount, MerchantProduct } from './adapter.js';

export interface MerchantApiClientConfig {
  accessToken: string;
  adapter?: MerchantApiAdapter;
}

const logger = createLogger({ package: 'merchant-api' });
const MERCHANT_API_BASE = 'https://merchantapi.googleapis.com/content/v1';

export class MerchantApiClient implements MerchantApiAdapter {
  private readonly accessToken: string;
  private readonly adapter?: MerchantApiAdapter;

  constructor(config: MerchantApiClientConfig) {
    this.accessToken = config.accessToken;
    this.adapter = config.adapter;
    logger.info('Merchant API client placeholder initialized', { base: MERCHANT_API_BASE });
  }

  async listAccounts(): Promise<MerchantAccount[]> {
    if (this.adapter) {
      return this.adapter.listAccounts();
    }
    throw new Error('Google Merchant API listAccounts not yet implemented');
  }

  async listProducts(accountId: string): Promise<MerchantProduct[]> {
    if (this.adapter) {
      return this.adapter.listProducts(accountId);
    }
    throw new Error('Google Merchant API listProducts not yet implemented');
  }

  async getAccountIssues(accountId: string): Promise<Record<string, unknown>[]> {
    if (this.adapter) {
      return this.adapter.getAccountIssues(accountId);
    }
    throw new Error('Google Merchant API getAccountIssues not yet implemented');
  }
}

export function createMerchantApiClient(config: MerchantApiClientConfig): MerchantApiClient {
  return new MerchantApiClient(config);
}
