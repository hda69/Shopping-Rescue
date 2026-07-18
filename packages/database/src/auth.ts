import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { getDb } from './client';
import {
  users,
  organizationMembers,
  organizations,
  stripeCustomers,
  scans,
  loginTokens,
  sessions,
  sites,
} from './schema/index';

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateAuthToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function createLoginToken(input: {
  email: string;
  locale?: 'en' | 'fr';
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const rawToken = generateAuthToken();
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS);

  await db.insert(loginTokens).values({
    email,
    tokenHash: hashAuthToken(rawToken),
    locale: input.locale ?? 'en',
    expiresAt,
  });

  return { rawToken, expiresAt };
}

export async function consumeLoginToken(rawToken: string): Promise<{
  email: string;
  locale: 'en' | 'fr';
} | null> {
  const db = getDb();
  const tokenHash = hashAuthToken(rawToken);
  const now = new Date();

  const [row] = await db
    .select()
    .from(loginTokens)
    .where(
      and(
        eq(loginTokens.tokenHash, tokenHash),
        isNull(loginTokens.usedAt),
        gt(loginTokens.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(loginTokens)
    .set({ usedAt: now })
    .where(eq(loginTokens.id, row.id));

  return {
    email: row.email,
    locale: row.locale === 'fr' ? 'fr' : 'en',
  };
}

export async function upsertUserByEmail(input: {
  email: string;
  locale?: 'en' | 'fr';
}): Promise<typeof users.$inferSelect> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const now = new Date();

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (input.locale && existing.locale !== input.locale) {
      const [updated] = await db
        .update(users)
        .set({ locale: input.locale, updatedAt: now })
        .where(eq(users.id, existing.id))
        .returning();
      return updated!;
    }
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email,
      locale: input.locale ?? 'en',
      role: 'user',
    })
    .returning();

  return created!;
}

export async function linkUserToOrganizationsByEmail(
  userId: string,
  email: string,
): Promise<string[]> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const orgIds = new Set<string>();

  const customers = await db
    .select({ organizationId: stripeCustomers.organizationId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.email, normalized));

  for (const row of customers) {
    orgIds.add(row.organizationId);
  }

  const visitorScans = await db
    .select({ organizationId: scans.organizationId })
    .from(scans)
    .where(eq(scans.visitorEmail, normalized));

  for (const row of visitorScans) {
    if (row.organizationId) orgIds.add(row.organizationId);
  }

  const linked: string[] = [];
  for (const organizationId of orgIds) {
    const [existing] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!existing) {
      await db.insert(organizationMembers).values({
        organizationId,
        userId,
        role: 'owner',
      });
    }
    linked.push(organizationId);
  }

  return linked;
}

export async function ensureUserMembershipForOrganization(input: {
  email: string;
  organizationId: string;
  locale?: 'en' | 'fr';
  role?: string;
}): Promise<typeof users.$inferSelect> {
  const user = await upsertUserByEmail({
    email: input.email,
    locale: input.locale,
  });

  const db = getDb();
  const [existing] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, input.organizationId),
        eq(organizationMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (!existing) {
    await db.insert(organizationMembers).values({
      organizationId: input.organizationId,
      userId: user.id,
      role: input.role ?? 'owner',
    });
  }

  return user;
}

export async function createSession(userId: string): Promise<{
  rawToken: string;
  expiresAt: Date;
  sessionId: string;
}> {
  const db = getDb();
  const rawToken = generateAuthToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash: hashAuthToken(rawToken),
      expiresAt,
    })
    .returning();

  return { rawToken, expiresAt, sessionId: session!.id };
}

export async function getSessionByToken(rawToken: string): Promise<{
  sessionId: string;
  userId: string;
  email: string;
  locale: string;
  expiresAt: Date;
} | null> {
  const db = getDb();
  const tokenHash = hashAuthToken(rawToken);
  const now = new Date();

  const [row] = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      locale: users.locale,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  if (!row) return null;

  await db
    .update(sessions)
    .set({ lastSeenAt: now })
    .where(eq(sessions.id, row.sessionId));

  return row;
}

export async function deleteSessionByToken(rawToken: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.tokenHash, hashAuthToken(rawToken)));
}

export async function listOrganizationsForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      plan: organizations.plan,
      role: organizationMembers.role,
      isSuspended: organizations.isSuspended,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(
      and(eq(organizationMembers.userId, userId), isNull(organizations.deletedAt)),
    )
    .orderBy(desc(organizations.createdAt));
}

export async function userHasOrganizationAccess(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function listSitesForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      id: sites.id,
      organizationId: sites.organizationId,
      url: sites.url,
      normalizedUrl: sites.normalizedUrl,
      name: sites.name,
      isActive: sites.isActive,
      orgPlan: organizations.plan,
      orgName: organizations.name,
    })
    .from(sites)
    .innerJoin(organizations, eq(sites.organizationId, organizations.id))
    .innerJoin(
      organizationMembers,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(sites.isActive, true),
        isNull(sites.deletedAt),
        isNull(organizations.deletedAt),
      ),
    )
    .orderBy(desc(sites.createdAt));
}

export async function getSiteForUser(userId: string, siteId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: sites.id,
      organizationId: sites.organizationId,
      url: sites.url,
      normalizedUrl: sites.normalizedUrl,
      name: sites.name,
      isActive: sites.isActive,
      orgPlan: organizations.plan,
      orgName: organizations.name,
    })
    .from(sites)
    .innerJoin(organizations, eq(sites.organizationId, organizations.id))
    .innerJoin(
      organizationMembers,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(sites.id, siteId),
        isNull(sites.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function countSitesForOrganization(organizationId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sites)
    .where(
      and(
        eq(sites.organizationId, organizationId),
        eq(sites.isActive, true),
        isNull(sites.deletedAt),
      ),
    );
  return row?.count ?? 0;
}

export async function listScansForSite(siteId: string, limit = 20) {
  const db = getDb();
  return db
    .select({
      id: scans.id,
      status: scans.status,
      riskScore: scans.riskScore,
      scanType: scans.scanType,
      createdAt: scans.createdAt,
      completedAt: scans.completedAt,
      isReportUnlocked: scans.isReportUnlocked,
    })
    .from(scans)
    .where(eq(scans.siteId, siteId))
    .orderBy(desc(scans.createdAt))
    .limit(limit);
}

export async function countManualScansToday(siteId: string): Promise<number> {
  const db = getDb();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scans)
    .where(
      and(
        eq(scans.siteId, siteId),
        eq(scans.scanType, 'full'),
        gt(scans.createdAt, start),
      ),
    );
  return row?.count ?? 0;
}
