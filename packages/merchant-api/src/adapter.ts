export interface MerchantAccount {
  id: string;
  name: string;
  websiteUrl?: string;
  accountType?: string;
}

export interface MerchantProduct {
  id: string;
  title: string;
  link: string;
  availability?: string;
}

export interface MerchantAccountIssue {
  issueId: string;
  severity?: string;
  title?: string;
  detail?: string;
  documentationUrl?: string;
  raw?: Record<string, unknown>;
}

export interface MerchantProductIssue {
  productId: string;
  productTitle?: string;
  issueCode?: string;
  severity?: string;
  detail?: string;
  raw?: Record<string, unknown>;
}

export interface MerchantApiAdapter {
  listAccounts(): Promise<MerchantAccount[]>;
  listProducts(accountId: string): Promise<MerchantProduct[]>;
  getAccountIssues(accountId: string): Promise<MerchantAccountIssue[]>;
  getProductIssues(accountId: string): Promise<MerchantProductIssue[]>;
  refreshAccessToken?(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;
}
