export interface MerchantAccount {
  id: string;
  name: string;
  websiteUrl?: string;
}

export interface MerchantProduct {
  id: string;
  title: string;
  link: string;
  availability?: string;
}

export interface MerchantApiAdapter {
  listAccounts(): Promise<MerchantAccount[]>;
  listProducts(accountId: string): Promise<MerchantProduct[]>;
  getAccountIssues(accountId: string): Promise<Record<string, unknown>[]>;
}
