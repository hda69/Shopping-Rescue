import { createLogger } from '@shopping-rescue/shared';
import type {
  MerchantApiAdapter,
  MerchantAccount,
  MerchantProduct,
  MerchantAccountIssue,
  MerchantProductIssue,
} from './adapter.js';

export interface MerchantApiClientConfig {
  accessToken: string;
  adapter?: MerchantApiAdapter;
}

const logger = createLogger({ package: 'merchant-api' });
const CONTENT_API_BASE = 'https://shoppingcontent.googleapis.com/content/v2.1';

async function googleFetch<T>(
  accessToken: string,
  url: string,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Merchant API error ${response.status}: ${body.slice(0, 500)}`);
  }

  return response.json() as Promise<T>;
}

export class MerchantApiClient implements MerchantApiAdapter {
  private readonly accessToken: string;
  private readonly adapter?: MerchantApiAdapter;

  constructor(config: MerchantApiClientConfig) {
    this.accessToken = config.accessToken;
    this.adapter = config.adapter;
    logger.info('Merchant API client initialized', { base: CONTENT_API_BASE });
  }

  async listAccounts(): Promise<MerchantAccount[]> {
    if (this.adapter) return this.adapter.listAccounts();

    const data = await googleFetch<{
      accountIdentifiers?: Array<{ merchantId?: string; aggregatorId?: string }>;
    }>(this.accessToken, `${CONTENT_API_BASE}/accounts/authinfo`);

    const ids = (data.accountIdentifiers ?? [])
      .map((row) => row.merchantId || row.aggregatorId)
      .filter((id): id is string => Boolean(id));

    const accounts: MerchantAccount[] = [];
    for (const id of ids.slice(0, 20)) {
      try {
        const account = await googleFetch<{
          id?: string;
          name?: string;
          websiteUrl?: string;
        }>(this.accessToken, `${CONTENT_API_BASE}/${id}/accounts/${id}`);
        accounts.push({
          id: String(account.id ?? id),
          name: account.name ?? `Merchant ${id}`,
          websiteUrl: account.websiteUrl,
          accountType: 'content',
        });
      } catch {
        accounts.push({ id, name: `Merchant ${id}`, accountType: 'content' });
      }
    }

    return accounts;
  }

  async listProducts(accountId: string): Promise<MerchantProduct[]> {
    if (this.adapter) return this.adapter.listProducts(accountId);

    const data = await googleFetch<{
      resources?: Array<{
        id?: string;
        title?: string;
        link?: string;
        availability?: string;
      }>;
    }>(
      this.accessToken,
      `${CONTENT_API_BASE}/${accountId}/products?maxResults=50`,
    );

    return (data.resources ?? []).map((product) => ({
      id: String(product.id ?? ''),
      title: product.title ?? 'Untitled',
      link: product.link ?? '',
      availability: product.availability,
    }));
  }

  async getAccountIssues(accountId: string): Promise<MerchantAccountIssue[]> {
    if (this.adapter) return this.adapter.getAccountIssues(accountId);

    try {
      const data = await googleFetch<{
        accountLevelIssues?: Array<{
          id?: string;
          severity?: string;
          title?: string;
          detail?: string;
          documentation?: string;
        }>;
      }>(
        this.accessToken,
        `${CONTENT_API_BASE}/${accountId}/accountstatuses/${accountId}`,
      );

      return (data.accountLevelIssues ?? []).map((issue) => ({
        issueId: String(issue.id ?? issue.title ?? 'unknown'),
        severity: issue.severity,
        title: issue.title,
        detail: issue.detail,
        documentationUrl: issue.documentation,
        raw: issue as Record<string, unknown>,
      }));
    } catch (error) {
      logger.warn('Failed to fetch account issues', {
        accountId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getProductIssues(accountId: string): Promise<MerchantProductIssue[]> {
    if (this.adapter) return this.adapter.getProductIssues(accountId);

    try {
      const data = await googleFetch<{
        resources?: Array<{
          productId?: string;
          title?: string;
          itemLevelIssues?: Array<{
            code?: string;
            servability?: string;
            description?: string;
          }>;
        }>;
      }>(
        this.accessToken,
        `${CONTENT_API_BASE}/${accountId}/productstatuses?maxResults=100`,
      );

      const issues: MerchantProductIssue[] = [];
      for (const product of data.resources ?? []) {
        for (const issue of product.itemLevelIssues ?? []) {
          issues.push({
            productId: String(product.productId ?? ''),
            productTitle: product.title,
            issueCode: issue.code,
            severity: issue.servability,
            detail: issue.description,
            raw: issue as Record<string, unknown>,
          });
        }
      }
      return issues;
    } catch (error) {
      logger.warn('Failed to fetch product issues', {
        accountId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}

export function createMerchantApiClient(config: MerchantApiClientConfig): MerchantApiClient {
  return new MerchantApiClient(config);
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token refresh failed: ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error('Google token refresh returned no access_token');
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in ?? 3600,
  };
}

export function getGoogleOAuthAuthorizeUrl(input: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: input.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/content email',
    access_type: 'offline',
    prompt: 'consent',
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleAuthCode(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: input.code,
    code_verifier: input.codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: input.redirectUri,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google OAuth exchange failed: ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
  };

  if (!data.access_token || !data.refresh_token) {
    throw new Error('Google OAuth did not return access/refresh tokens');
  }

  let email: string | undefined;
  if (data.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(data.id_token.split('.')[1] ?? '', 'base64url').toString('utf8'),
      ) as { email?: string };
      email = payload.email;
    } catch {
      // ignore
    }
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 3600,
    email,
  };
}
