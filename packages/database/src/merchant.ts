import { and, desc, eq, isNull } from 'drizzle-orm';
import { encrypt, decrypt, generateIdempotencyKey } from '@shopping-rescue/shared';
import { getDb } from './client';
import {
  merchantConnections,
  merchantAccounts,
  merchantAccountIssues,
  merchantProductIssues,
} from './schema/index';
import { createJob } from './jobs';
import { userHasOrganizationAccess } from './auth';

function encryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  }
  return key;
}

export async function saveMerchantConnection(input: {
  organizationId: string;
  siteId?: string | null;
  googleAccountEmail: string;
  refreshToken: string;
  accessToken?: string | null;
  tokenExpiresAt?: Date | null;
  scopes?: string[];
}) {
  const db = getDb();
  const key = encryptionKey();
  const now = new Date();

  const existing = await db
    .select()
    .from(merchantConnections)
    .where(
      and(
        eq(merchantConnections.organizationId, input.organizationId),
        isNull(merchantConnections.deletedAt),
      ),
    )
    .limit(1);

  const values = {
    googleAccountEmail: input.googleAccountEmail,
    refreshTokenEnc: encrypt(input.refreshToken, key),
    accessTokenEnc: input.accessToken ? encrypt(input.accessToken, key) : null,
    tokenExpiresAt: input.tokenExpiresAt ?? null,
    scopes: input.scopes ?? ['https://www.googleapis.com/auth/content'],
    status: 'active',
    siteId: input.siteId ?? null,
    updatedAt: now,
    deletedAt: null,
  };

  if (existing[0]) {
    const [updated] = await db
      .update(merchantConnections)
      .set(values)
      .where(eq(merchantConnections.id, existing[0].id))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(merchantConnections)
    .values({
      organizationId: input.organizationId,
      ...values,
    })
    .returning();
  return created!;
}

export async function getMerchantConnectionForOrg(organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(merchantConnections)
    .where(
      and(
        eq(merchantConnections.organizationId, organizationId),
        isNull(merchantConnections.deletedAt),
      ),
    )
    .orderBy(desc(merchantConnections.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getDecryptedMerchantTokens(connectionId: string): Promise<{
  refreshToken: string;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
  organizationId: string;
} | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(merchantConnections)
    .where(eq(merchantConnections.id, connectionId))
    .limit(1);

  if (!row || row.deletedAt) return null;

  const key = encryptionKey();
  return {
    refreshToken: decrypt(row.refreshTokenEnc, key),
    accessToken: row.accessTokenEnc ? decrypt(row.accessTokenEnc, key) : null,
    tokenExpiresAt: row.tokenExpiresAt,
    organizationId: row.organizationId,
  };
}

export async function updateMerchantAccessToken(
  connectionId: string,
  accessToken: string,
  tokenExpiresAt: Date,
) {
  const db = getDb();
  const key = encryptionKey();
  await db
    .update(merchantConnections)
    .set({
      accessTokenEnc: encrypt(accessToken, key),
      tokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(merchantConnections.id, connectionId));
}

export async function softDeleteMerchantConnection(connectionId: string) {
  const db = getDb();
  await db
    .update(merchantConnections)
    .set({
      status: 'revoked',
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(merchantConnections.id, connectionId));
}

export async function upsertMerchantAccounts(
  connectionId: string,
  accounts: Array<{ id: string; name: string; accountType?: string; raw?: unknown }>,
) {
  const db = getDb();
  const now = new Date();
  const saved = [];

  for (const account of accounts) {
    const [existing] = await db
      .select()
      .from(merchantAccounts)
      .where(
        and(
          eq(merchantAccounts.merchantConnectionId, connectionId),
          eq(merchantAccounts.googleAccountId, account.id),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(merchantAccounts)
        .set({
          accountName: account.name,
          accountType: account.accountType ?? existing.accountType,
          rawData: (account.raw as Record<string, unknown>) ?? existing.rawData,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(merchantAccounts.id, existing.id))
        .returning();
      saved.push(updated!);
    } else {
      const [created] = await db
        .insert(merchantAccounts)
        .values({
          merchantConnectionId: connectionId,
          googleAccountId: account.id,
          accountName: account.name,
          accountType: account.accountType ?? null,
          isSelected: accounts.length === 1,
          rawData: (account.raw as Record<string, unknown>) ?? null,
          lastSyncedAt: now,
        })
        .returning();
      saved.push(created!);
    }
  }

  return saved;
}

export async function selectMerchantAccount(connectionId: string, accountId: string) {
  const db = getDb();
  await db
    .update(merchantAccounts)
    .set({ isSelected: false, updatedAt: new Date() })
    .where(eq(merchantAccounts.merchantConnectionId, connectionId));

  await db
    .update(merchantAccounts)
    .set({ isSelected: true, updatedAt: new Date() })
    .where(
      and(
        eq(merchantAccounts.merchantConnectionId, connectionId),
        eq(merchantAccounts.id, accountId),
      ),
    );
}

export async function listMerchantAccounts(connectionId: string) {
  const db = getDb();
  return db
    .select()
    .from(merchantAccounts)
    .where(eq(merchantAccounts.merchantConnectionId, connectionId))
    .orderBy(desc(merchantAccounts.isSelected), desc(merchantAccounts.createdAt));
}

export async function getSelectedMerchantAccount(connectionId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(merchantAccounts)
    .where(
      and(
        eq(merchantAccounts.merchantConnectionId, connectionId),
        eq(merchantAccounts.isSelected, true),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function replaceMerchantAccountIssues(
  merchantAccountId: string,
  issues: Array<{
    issueId: string;
    severity?: string | null;
    title?: string | null;
    detail?: string | null;
    documentationUrl?: string | null;
    raw?: unknown;
  }>,
  scanId?: string | null,
) {
  const db = getDb();
  await db
    .delete(merchantAccountIssues)
    .where(eq(merchantAccountIssues.merchantAccountId, merchantAccountId));

  if (issues.length === 0) return;

  await db.insert(merchantAccountIssues).values(
    issues.map((issue) => ({
      merchantAccountId,
      scanId: scanId ?? null,
      issueId: issue.issueId,
      severity: issue.severity ?? null,
      title: issue.title ?? null,
      detail: issue.detail ?? null,
      documentationUrl: issue.documentationUrl ?? null,
      rawData: (issue.raw as Record<string, unknown>) ?? null,
    })),
  );
}

export async function replaceMerchantProductIssues(
  merchantAccountId: string,
  issues: Array<{
    productId: string;
    productTitle?: string | null;
    issueCode?: string | null;
    severity?: string | null;
    detail?: string | null;
    raw?: unknown;
  }>,
  scanId?: string | null,
) {
  const db = getDb();
  await db
    .delete(merchantProductIssues)
    .where(eq(merchantProductIssues.merchantAccountId, merchantAccountId));

  if (issues.length === 0) return;

  await db.insert(merchantProductIssues).values(
    issues.map((issue) => ({
      merchantAccountId,
      scanId: scanId ?? null,
      productId: issue.productId,
      productTitle: issue.productTitle ?? null,
      issueCode: issue.issueCode ?? null,
      severity: issue.severity ?? null,
      detail: issue.detail ?? null,
      rawData: (issue.raw as Record<string, unknown>) ?? null,
    })),
  );
}

export async function listMerchantAccountIssues(merchantAccountId: string, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(merchantAccountIssues)
    .where(eq(merchantAccountIssues.merchantAccountId, merchantAccountId))
    .orderBy(desc(merchantAccountIssues.syncedAt))
    .limit(limit);
}

export async function markMerchantConnectionSynced(connectionId: string) {
  const db = getDb();
  await db
    .update(merchantConnections)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(merchantConnections.id, connectionId));
}

export async function enqueueMerchantSync(input: {
  organizationId: string;
  connectionId: string;
  siteId?: string | null;
}) {
  return createJob({
    jobType: 'MERCHANT_SYNC',
    organizationId: input.organizationId,
    siteId: input.siteId ?? undefined,
    idempotencyKey: generateIdempotencyKey(`merchant_sync_${input.connectionId}`),
    payload: {
      connectionId: input.connectionId,
      organizationId: input.organizationId,
    },
  });
}

export async function getMerchantConnectionForUser(userId: string, organizationId: string) {
  const allowed = await userHasOrganizationAccess(userId, organizationId);
  if (!allowed) return null;
  return getMerchantConnectionForOrg(organizationId);
}
