import { loadEnv } from '@shopping-rescue/shared/load-env';
import {
  completeJob,
  failJob,
  updateJobProgress,
  getDecryptedMerchantTokens,
  updateMerchantAccessToken,
  upsertMerchantAccounts,
  getSelectedMerchantAccount,
  listMerchantAccounts,
  replaceMerchantAccountIssues,
  replaceMerchantProductIssues,
  markMerchantConnectionSynced,
} from '@shopping-rescue/database';
import {
  createMerchantApiClient,
  refreshGoogleAccessToken,
} from '@shopping-rescue/merchant-api';
import { createLogger } from '@shopping-rescue/shared';
import type { JobRecord } from './index.js';

loadEnv();

export async function handleMerchantSync(job: JobRecord): Promise<void> {
  const logger = createLogger({ jobId: job.id, jobType: 'MERCHANT_SYNC' });
  const payload = (job.payload ?? {}) as { connectionId?: string };
  const connectionId = payload.connectionId;

  if (!connectionId) {
    await failJob(job.id, 'Missing connectionId on MERCHANT_SYNC job');
    return;
  }

  try {
    await updateJobProgress(job.id, 10);
    const tokens = await getDecryptedMerchantTokens(connectionId);
    if (!tokens) {
      await failJob(job.id, 'Merchant connection not found');
      return;
    }

    let accessToken = tokens.accessToken;
    const needsRefresh =
      !accessToken ||
      !tokens.tokenExpiresAt ||
      tokens.tokenExpiresAt.getTime() < Date.now() + 60_000;

    if (needsRefresh) {
      const refreshed = await refreshGoogleAccessToken(tokens.refreshToken);
      accessToken = refreshed.accessToken;
      await updateMerchantAccessToken(
        connectionId,
        refreshed.accessToken,
        new Date(Date.now() + refreshed.expiresIn * 1000),
      );
    }

    if (!accessToken) {
      await failJob(job.id, 'No access token available');
      return;
    }

    await updateJobProgress(job.id, 30);
    const client = createMerchantApiClient({ accessToken });
    const accounts = await client.listAccounts();
    await upsertMerchantAccounts(
      connectionId,
      accounts.map((account) => ({
        id: account.id,
        name: account.name,
        accountType: account.accountType,
        raw: account,
      })),
    );

    await updateJobProgress(job.id, 60);
    let selected = await getSelectedMerchantAccount(connectionId);
    if (!selected) {
      const all = await listMerchantAccounts(connectionId);
      selected = all[0] ?? null;
    }

    if (selected) {
      const accountIssues = await client.getAccountIssues(selected.googleAccountId);
      await replaceMerchantAccountIssues(
        selected.id,
        accountIssues.map((issue) => ({
          issueId: issue.issueId,
          severity: issue.severity,
          title: issue.title,
          detail: issue.detail,
          documentationUrl: issue.documentationUrl,
          raw: issue.raw,
        })),
      );

      const productIssues = await client.getProductIssues(selected.googleAccountId);
      await replaceMerchantProductIssues(
        selected.id,
        productIssues.slice(0, 500).map((issue) => ({
          productId: issue.productId,
          productTitle: issue.productTitle,
          issueCode: issue.issueCode,
          severity: issue.severity,
          detail: issue.detail,
          raw: issue.raw,
        })),
      );
    }

    await markMerchantConnectionSynced(connectionId);
    await updateJobProgress(job.id, 100);
    await completeJob(job.id);
    logger.info('MERCHANT_SYNC completed', { connectionId, accounts: accounts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MERCHANT_SYNC failed';
    logger.error('MERCHANT_SYNC failed', { connectionId, error: message });
    await failJob(job.id, message);
  }
}
