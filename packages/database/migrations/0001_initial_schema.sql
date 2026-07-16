-- Shopping Rescue: Initial Schema Migration
-- Version: 0001

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (synced from Supabase Auth)
CREATE TABLE users (
  id            UUID PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  locale        TEXT NOT NULL DEFAULT 'en',
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Organizations
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  plan          TEXT NOT NULL DEFAULT 'free',
  plan_limits   JSONB,
  is_suspended  BOOLEAN NOT NULL DEFAULT false,
  white_label   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  role            TEXT NOT NULL DEFAULT 'member',
  invited_by      UUID REFERENCES users(id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- Sites
CREATE TABLE sites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  url               TEXT NOT NULL,
  normalized_url    TEXT NOT NULL,
  name              TEXT,
  platform          TEXT,
  country           TEXT,
  mc_issue_type     TEXT,
  review_requests   INTEGER DEFAULT 0,
  ownership_status  TEXT NOT NULL DEFAULT 'unverified',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE (organization_id, normalized_url)
);

CREATE TABLE site_ownership_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES sites(id),
  method          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  token_hash      TEXT,
  expires_at      TIMESTAMPTZ,
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant Center
CREATE TABLE merchant_connections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id),
  site_id               UUID REFERENCES sites(id),
  google_account_email  TEXT NOT NULL,
  refresh_token_enc     TEXT NOT NULL,
  access_token_enc      TEXT,
  token_expires_at      TIMESTAMPTZ,
  scopes                TEXT[] NOT NULL DEFAULT '{https://www.googleapis.com/auth/content}',
  status                TEXT NOT NULL DEFAULT 'active',
  last_sync_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

CREATE TABLE merchant_accounts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_connection_id  UUID NOT NULL REFERENCES merchant_connections(id),
  google_account_id       TEXT NOT NULL,
  account_name            TEXT,
  account_type            TEXT,
  is_selected             BOOLEAN NOT NULL DEFAULT false,
  raw_data                JSONB,
  last_synced_at          TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_connection_id, google_account_id)
);

-- Stripe
CREATE TABLE stripe_customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email             TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id),
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  stripe_customer_id      TEXT NOT NULL,
  plan                    TEXT NOT NULL,
  status                  TEXT NOT NULL,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  trial_end               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE one_time_purchases (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id),
  site_id                 UUID REFERENCES sites(id),
  scan_id                 UUID,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT UNIQUE,
  plan                    TEXT NOT NULL DEFAULT 'full_audit',
  amount_cents            INTEGER NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'eur',
  status                  TEXT NOT NULL DEFAULT 'pending',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scans
CREATE TABLE scans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID REFERENCES organizations(id),
  site_id           UUID NOT NULL REFERENCES sites(id),
  scan_type         TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  risk_score        INTEGER,
  risk_level        TEXT,
  confidence_level  TEXT,
  pages_crawled     INTEGER DEFAULT 0,
  products_analyzed INTEGER DEFAULT 0,
  rules_version     TEXT,
  previous_scan_id  UUID REFERENCES scans(id),
  is_report_unlocked BOOLEAN NOT NULL DEFAULT false,
  visitor_email     TEXT,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scans_site ON scans (site_id, created_at DESC);

CREATE TABLE scan_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  site_id         UUID REFERENCES sites(id),
  scan_id         UUID REFERENCES scans(id),
  job_type        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'queued',
  priority        INTEGER NOT NULL DEFAULT 0,
  attempts        INTEGER NOT NULL DEFAULT 0,
  max_attempts    INTEGER NOT NULL DEFAULT 3,
  idempotency_key TEXT UNIQUE,
  payload         JSONB NOT NULL DEFAULT '{}',
  progress        INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  timeout_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_jobs_poll ON scan_jobs (status, scheduled_at) WHERE status = 'queued';

CREATE TABLE scan_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  normalized_url  TEXT NOT NULL,
  page_type       TEXT,
  http_status     INTEGER,
  redirect_chain  JSONB,
  title           TEXT,
  meta_description TEXT,
  language        TEXT,
  content_hash    TEXT,
  json_ld         JSONB,
  visible_text    TEXT,
  screenshot_path TEXT,
  response_time_ms INTEGER,
  crawled_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scan_id, normalized_url)
);

CREATE TABLE scan_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  page_id         UUID REFERENCES scan_pages(id),
  url             TEXT NOT NULL,
  title           TEXT,
  price           NUMERIC(12,2),
  currency        TEXT,
  availability    TEXT,
  json_ld_price   NUMERIC(12,2),
  json_ld_availability TEXT,
  image_url       TEXT,
  description     TEXT,
  platform_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant issues
CREATE TABLE merchant_account_issues (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  scan_id             UUID REFERENCES scans(id),
  issue_id            TEXT NOT NULL,
  severity            TEXT,
  title               TEXT,
  detail              TEXT,
  documentation_url   TEXT,
  raw_data            JSONB,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE merchant_product_issues (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  scan_id             UUID REFERENCES scans(id),
  product_id          TEXT NOT NULL,
  product_title       TEXT,
  issue_code          TEXT,
  severity            TEXT,
  detail              TEXT,
  raw_data            JSONB,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rules & Findings
CREATE TABLE rule_definitions (
  id                    TEXT NOT NULL,
  version               INTEGER NOT NULL,
  category              TEXT NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL,
  severity              TEXT NOT NULL,
  confidence_method     TEXT NOT NULL,
  evidence_requirements JSONB NOT NULL DEFAULT '[]',
  remediation_template  TEXT NOT NULL,
  policy_reference      TEXT,
  enabled               BOOLEAN NOT NULL DEFAULT true,
  published_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, version)
);

CREATE TABLE findings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  rule_id         TEXT NOT NULL,
  rule_version    INTEGER NOT NULL,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  severity        TEXT NOT NULL,
  confidence      NUMERIC(3,2) NOT NULL,
  affected_url    TEXT,
  evidence        JSONB NOT NULL DEFAULT '{}',
  explanation     TEXT NOT NULL,
  recommendation  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open',
  is_ai_assisted  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_findings_scan ON findings (scan_id);
CREATE INDEX idx_findings_severity ON findings (scan_id, severity);

CREATE TABLE finding_evidence (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id  UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  content     JSONB NOT NULL,
  source_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         UUID NOT NULL REFERENCES scans(id) UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  summary         TEXT,
  narrative       TEXT,
  checklist       JSONB,
  comparison      JSONB,
  is_full_access  BOOLEAN NOT NULL DEFAULT false,
  visible_findings INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_exports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES reports(id),
  export_type TEXT NOT NULL,
  file_path   TEXT,
  file_size   INTEGER,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  scan_completed    BOOLEAN NOT NULL DEFAULT true,
  critical_alerts   BOOLEAN NOT NULL DEFAULT true,
  weekly_summary    BOOLEAN NOT NULL DEFAULT true,
  marketing         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

CREATE TABLE email_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  email       TEXT NOT NULL,
  template    TEXT NOT NULL,
  status      TEXT NOT NULL,
  resend_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System
CREATE TABLE usage_counters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  scans_count       INTEGER NOT NULL DEFAULT 0,
  pages_crawled     INTEGER NOT NULL DEFAULT 0,
  ai_tokens_used    INTEGER NOT NULL DEFAULT 0,
  ai_cost_cents     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, period_start)
);

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     UUID,
  metadata        JSONB,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs (organization_id, created_at DESC);

CREATE TABLE webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'received',
  error_message   TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

CREATE TABLE system_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scans_updated_at BEFORE UPDATE ON scans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scan_jobs_updated_at BEFORE UPDATE ON scan_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
