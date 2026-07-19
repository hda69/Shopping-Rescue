import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  unique,
  index,
  date,
  inet,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  locale: text('locale').notNull().default('en'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('user'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  planLimits: jsonb('plan_limits'),
  isSuspended: boolean('is_suspended').notNull().default(false),
  whiteLabel: boolean('white_label').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull().default('member'),
    invitedBy: uuid('invited_by').references(() => users.id),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.organizationId, table.userId)],
);

export const sites = pgTable(
  'sites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    url: text('url').notNull(),
    normalizedUrl: text('normalized_url').notNull(),
    name: text('name'),
    platform: text('platform'),
    country: text('country'),
    mcIssueType: text('mc_issue_type'),
    reviewRequests: integer('review_requests').default(0),
    ownershipStatus: text('ownership_status').notNull().default('unverified'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [unique().on(table.organizationId, table.normalizedUrl)],
);

export const scanJobs = pgTable(
  'scan_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id),
    siteId: uuid('site_id').references(() => sites.id),
    scanId: uuid('scan_id'),
    jobType: text('job_type').notNull(),
    status: text('status').notNull().default('queued'),
    priority: integer('priority').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    idempotencyKey: text('idempotency_key').unique(),
    payload: jsonb('payload').notNull().default({}),
    progress: integer('progress').notNull().default(0),
    errorMessage: text('error_message'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    timeoutAt: timestamp('timeout_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_scan_jobs_poll').on(table.status, table.scheduledAt),
  ],
);

export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  siteId: uuid('site_id')
    .notNull()
    .references(() => sites.id),
  scanType: text('scan_type').notNull(),
  status: text('status').notNull().default('pending'),
  riskScore: integer('risk_score'),
  riskLevel: text('risk_level'),
  confidenceLevel: text('confidence_level'),
  pagesCrawled: integer('pages_crawled').default(0),
  productsAnalyzed: integer('products_analyzed').default(0),
  rulesVersion: text('rules_version'),
  previousScanId: uuid('previous_scan_id'),
  isReportUnlocked: boolean('is_report_unlocked').notNull().default(false),
  visitorEmail: text('visitor_email'),
  visitorLocale: text('visitor_locale').notNull().default('en'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const scanPages = pgTable(
  'scan_pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    normalizedUrl: text('normalized_url').notNull(),
    pageType: text('page_type'),
    httpStatus: integer('http_status'),
    redirectChain: jsonb('redirect_chain'),
    title: text('title'),
    metaDescription: text('meta_description'),
    language: text('language'),
    contentHash: text('content_hash'),
    jsonLd: jsonb('json_ld'),
    visibleText: text('visible_text'),
    screenshotPath: text('screenshot_path'),
    responseTimeMs: integer('response_time_ms'),
    crawledAt: timestamp('crawled_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.scanId, table.normalizedUrl)],
);

export const scanProducts = pgTable('scan_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  scanId: uuid('scan_id')
    .notNull()
    .references(() => scans.id, { onDelete: 'cascade' }),
  pageId: uuid('page_id').references(() => scanPages.id),
  url: text('url').notNull(),
  title: text('title'),
  price: numeric('price', { precision: 12, scale: 2 }),
  currency: text('currency'),
  availability: text('availability'),
  jsonLdPrice: numeric('json_ld_price', { precision: 12, scale: 2 }),
  jsonLdAvailability: text('json_ld_availability'),
  imageUrl: text('image_url'),
  description: text('description'),
  platformData: jsonb('platform_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const findings = pgTable(
  'findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    ruleId: text('rule_id').notNull(),
    ruleVersion: integer('rule_version').notNull(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    severity: text('severity').notNull(),
    confidence: numeric('confidence', { precision: 3, scale: 2 }).notNull(),
    affectedUrl: text('affected_url'),
    evidence: jsonb('evidence').notNull().default({}),
    explanation: text('explanation').notNull(),
    recommendation: text('recommendation').notNull(),
    status: text('status').notNull().default('open'),
    isAiAssisted: boolean('is_ai_assisted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_findings_scan').on(table.scanId),
    index('idx_findings_severity').on(table.scanId, table.severity),
  ],
);

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  scanId: uuid('scan_id')
    .notNull()
    .references(() => scans.id)
    .unique(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  summary: text('summary'),
  narrative: text('narrative'),
  checklist: jsonb('checklist'),
  comparison: jsonb('comparison'),
  isFullAccess: boolean('is_full_access').notNull().default(false),
  visibleFindings: integer('visible_findings'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const stripeCustomers = pgTable('stripe_customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id)
    .unique(),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  plan: text('plan').notNull(),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    status: text('status').notNull().default('received'),
    errorMessage: text('error_message'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.provider, table.eventId)],
);

export const oneTimePurchases = pgTable('one_time_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  siteId: uuid('site_id').references(() => sites.id),
  scanId: uuid('scan_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  plan: text('plan').notNull().default('full_audit'),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('eur'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: uuid('resource_id'),
    metadata: jsonb('metadata'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_audit_logs_org').on(table.organizationId, table.createdAt)],
);

export const usageCounters = pgTable(
  'usage_counters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    scansCount: integer('scans_count').notNull().default(0),
    pagesCrawled: integer('pages_crawled').notNull().default(0),
    aiTokensUsed: integer('ai_tokens_used').notNull().default(0),
    aiCostCents: integer('ai_cost_cents').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.organizationId, table.periodStart)],
);

export const loginTokens = pgTable('login_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  locale: text('locale').notNull().default('en'),
  purpose: text('purpose').notNull().default('password_reset'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
});

export const merchantConnections = pgTable('merchant_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  siteId: uuid('site_id').references(() => sites.id),
  googleAccountEmail: text('google_account_email').notNull(),
  refreshTokenEnc: text('refresh_token_enc').notNull(),
  accessTokenEnc: text('access_token_enc'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  scopes: text('scopes')
    .array()
    .notNull()
    .default(['https://www.googleapis.com/auth/content']),
  status: text('status').notNull().default('active'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const merchantAccounts = pgTable(
  'merchant_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    merchantConnectionId: uuid('merchant_connection_id')
      .notNull()
      .references(() => merchantConnections.id),
    googleAccountId: text('google_account_id').notNull(),
    accountName: text('account_name'),
    accountType: text('account_type'),
    isSelected: boolean('is_selected').notNull().default(false),
    rawData: jsonb('raw_data'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.merchantConnectionId, table.googleAccountId)],
);

export const merchantAccountIssues = pgTable('merchant_account_issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantAccountId: uuid('merchant_account_id')
    .notNull()
    .references(() => merchantAccounts.id),
  scanId: uuid('scan_id').references(() => scans.id),
  issueId: text('issue_id').notNull(),
  severity: text('severity'),
  title: text('title'),
  detail: text('detail'),
  documentationUrl: text('documentation_url'),
  rawData: jsonb('raw_data'),
  syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
});

export const merchantProductIssues = pgTable('merchant_product_issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantAccountId: uuid('merchant_account_id')
    .notNull()
    .references(() => merchantAccounts.id),
  scanId: uuid('scan_id').references(() => scans.id),
  productId: text('product_id').notNull(),
  productTitle: text('product_title'),
  issueCode: text('issue_code'),
  severity: text('severity'),
  detail: text('detail'),
  rawData: jsonb('raw_data'),
  syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
});
