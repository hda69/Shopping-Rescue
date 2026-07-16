# Shopping Rescue — Architecture

> Version: 1.0.0 · Last updated: 2026-07-12

## 1. Overview

Shopping Rescue is a **pnpm monorepo** with two deployable applications and eleven shared packages. The architecture separates concerns: the web app handles HTTP/UI, the worker handles long-running jobs (crawling, reporting, sync).

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│   Browser · Stripe · Google OAuth · Resend · Sentry             │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │   apps/web      │             │  apps/worker    │
    │   Next.js 15    │             │  Node.js        │
    │   App Router    │             │  Playwright     │
    └────────┬────────┘             └────────┬────────┘
             │                               │
             └───────────┬───────────────────┘
                         │
              ┌──────────▼──────────┐
              │   packages/*        │
              │   shared logic      │
              └──────────┬──────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼───┐         ┌──────▼──────┐      ┌──────▼──────┐
│Supabase│         │   Stripe    │      │ Google APIs │
│Auth+DB │         │  Checkout   │      │ Merchant v1 │
│Storage │         │  Webhooks   │      │ OAuth 2.0   │
└────────┘         └─────────────┘      └─────────────┘
```

---

## 2. Repository Structure

```
shopping-rescue/
├── apps/
│   ├── web/                 # Next.js 15 App Router
│   └── worker/              # Background job processor
├── packages/
│   ├── database/            # Schema, migrations, queries, RLS
│   ├── auth/                # Supabase auth helpers, session
│   ├── billing/             # Stripe checkout, webhooks, portal
│   ├── merchant-api/        # Google Merchant API v1 client
│   ├── scanner/             # Playwright crawler + SSRF guard
│   ├── rules-engine/        # Deterministic rules + scoring
│   ├── reporting/           # Report builder, PDF, readiness pack
│   ├── email/               # Resend templates + senders
│   ├── shared/              # Types, utils, config, validation
│   └── ui/                  # shadcn/ui components
├── docs/                    # Design documents
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 3. Applications

### 3.1 `apps/web`

| Responsibility | Technology |
|---|---|
| UI / SSR / API routes | Next.js 15 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (SSR cookies) |
| API | Route handlers + Server Actions |
| i18n | next-intl (`/en`, `/fr`) |
| Observability | Sentry Next.js SDK |

**Key API routes:**

| Route | Method | Purpose |
|---|---|---|
| `/api/scans` | POST | Enqueue free/full scan |
| `/api/webhooks/stripe` | POST | Stripe event processing |
| `/api/oauth/google` | GET | OAuth initiation |
| `/api/oauth/google/callback` | GET | OAuth callback |
| `/api/health` | GET | Health check |
| `/api/cron/weekly-scans` | POST | Trigger weekly monitoring |

**Security middleware:**
- CSP headers
- CSRF tokens on mutations
- Rate limiting (Upstash or in-memory for dev)
- Request size limits

### 3.2 `apps/worker`

Long-running process that polls PostgreSQL job queue.

| Responsibility | Technology |
|---|---|
| Job polling | PostgreSQL `FOR UPDATE SKIP LOCKED` |
| Crawling | Playwright (Chromium) |
| Report generation | `@shopping-rescue/reporting` |
| Email sending | `@shopping-rescue/email` |
| MC sync | `@shopping-rescue/merchant-api` |

**Job types:**

```
FREE_SITE_SCAN
FULL_SITE_SCAN
MERCHANT_SYNC
WEEKLY_MONITORING_SCAN
GENERATE_REPORT
GENERATE_PDF
SEND_SCAN_COMPLETED_EMAIL
SEND_RISK_ALERT
DELETE_EXPIRED_DATA
RETRY_FAILED_INTEGRATION
```

**Job lifecycle:**

```
queued → running → completed
                 → failed (retry with backoff)
                 → cancelled
```

Worker survives restarts: jobs remain in DB, picked up on next poll.

---

## 4. Packages

### 4.1 `packages/shared`

- Zod schemas for all domain types
- Plan limits configuration
- URL normalization
- Encryption utilities (AES-256-GCM for refresh tokens)
- Structured logging (JSON + correlation ID)
- `AIProvider` interface

### 4.2 `packages/database`

- Drizzle ORM (or Supabase client + typed queries)
- Versioned SQL migrations
- RLS policies
- Seed data for development
- Job queue functions

### 4.3 `packages/auth`

- Supabase server/client helpers
- Session management
- Role checks (owner, member, admin)
- CSRF token generation/validation

### 4.4 `packages/billing`

- Stripe Checkout session creation
- Webhook signature verification + idempotent processing
- Billing Portal session creation
- Plan entitlement resolution

### 4.5 `packages/merchant-api`

Isolated adapter for Google Merchant API v1:

```
MerchantApiClient
├── listAccounts()
├── getAccountIssues()
├── listProducts()
├── getProductIssues()
├── getProductStats()
└── refreshAccessToken()
```

- Exponential backoff with jitter on 429/5xx
- Raw response storage in Supabase Storage
- Normalized output schema
- Adapter interface for endpoint changes

### 4.6 `packages/scanner`

```
Scanner
├── UrlValidator (SSRF protection)
├── RobotsParser
├── SitemapDiscovery
├── PageCrawler (Playwright)
├── ContentExtractor (text, JSON-LD, meta)
├── ScreenshotCapture
└── PlatformDetector
```

Runs **only** in worker — never in serverless functions.

### 4.7 `packages/rules-engine`

```
RulesEngine
├── RuleRegistry (versioned definitions)
├── RuleEvaluator (deterministic)
├── AIAssistedEvaluator (optional, structured output)
├── ScoreCalculator
└── FindingGenerator
```

### 4.8 `packages/reporting`

```
ReportBuilder
├── WebReportRenderer
├── PdfGenerator (puppeteer or @react-pdf/renderer)
├── ReadinessPackBuilder
└── ScanComparator (diff between scans)
```

### 4.9 `packages/email`

- React Email templates
- Resend integration
- Preference-aware sending

### 4.10 `packages/ui`

- shadcn/ui components
- Design tokens (navy, white, gray, orange alerts, red critical)
- Shared layout components

---

## 5. Data Flow

### 5.1 Free Scan

```
1. Web validates URL + form → creates scan_job (FREE_SITE_SCAN)
2. Worker picks job → scanner crawls (15 pages, 20 products)
3. Rules engine evaluates → findings + score stored
4. Worker enqueues SEND_SCAN_COMPLETED_EMAIL
5. Worker enqueues GENERATE_REPORT (partial, 2 findings visible)
6. User views results → upsell to Full Audit
```

### 5.2 Paid Unlock

```
1. User clicks "Buy Full Audit" → Stripe Checkout session
2. Stripe webhook: checkout.session.completed
3. billing package creates one_time_purchase, updates entitlements
4. Web unlocks full report (all findings visible)
5. Worker can enqueue FULL_SITE_SCAN if not yet run at full depth
```

### 5.3 Monitoring Scan

```
1. Cron (or scheduled job) checks subscriptions with weekly interval
2. Enqueues WEEKLY_MONITORING_SCAN per site
3. Worker: FULL_SITE_SCAN + MERCHANT_SYNC (if connected)
4. ScanComparator diffs with previous scan
5. SEND_RISK_ALERT if new critical/high findings
```

---

## 6. Authentication & Authorization

### Supabase Auth

- Email/password + magic link
- Google OAuth for login (separate from MC OAuth)
- JWT in httpOnly secure cookies

### Roles

| Role | Scope |
|---|---|
| `owner` | Full org access |
| `member` | Read + scan, no billing |
| `admin` | Platform admin (system_settings, all orgs) |

### RLS

Every tenant table filtered by `organization_id`. Service role used only in worker/web API routes — never exposed to client.

---

## 7. External Integrations

| Service | Purpose | Auth |
|---|---|---|
| Supabase | Auth, DB, Storage | API keys (server only) |
| Stripe | Payments | Secret key + webhook signing |
| Google OAuth | MC connection | Client ID/secret, encrypted refresh |
| Google Merchant API v1 | Issues, products | Bearer token from refresh |
| Resend | Transactional email | API key |
| Sentry | Error tracking | DSN |
| OpenAI / Anthropic | AI-assisted analysis | API key (optional) |

---

## 8. Deployment

### Local development

```bash
docker compose up -d          # PostgreSQL (or use Supabase local)
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev                      # web + worker concurrently
```

### Production (Railway / Render)

| Service | Dockerfile | Notes |
|---|---|---|
| web | `apps/web/Dockerfile` | Next.js standalone output |
| worker | `apps/worker/Dockerfile` | Playwright + Chromium deps |
| cron | Railway cron / Render cron | Weekly scans, cleanup |

Environment variables documented in `.env.example`.

### Health checks

- `GET /api/health` — web (DB connectivity)
- Worker exposes HTTP `:3001/health` — job queue depth, last poll

---

## 9. Observability

| Signal | Tool |
|---|---|
| Errors | Sentry (web + worker) |
| Logs | Structured JSON, correlation ID per request/job |
| Metrics | Custom counters in `usage_counters` + optional Prometheus |
| Alerts | Sentry alerts + email to ops on threshold breach |

**Alert conditions:**
- Job queue stalled (> N queued for > M minutes)
- Failure rate > threshold
- Unprocessed Stripe webhook > 5 min
- Scan duration > plan timeout
- AI cost anomaly
- Merchant API error spike

---

## 10. Technology Choices

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo tool | pnpm workspaces + Turborepo | Fast installs, cached builds |
| ORM | Drizzle ORM | Type-safe, SQL migrations, lightweight |
| Job queue | PostgreSQL polling | No extra infra, survives restarts |
| Crawler host | Dedicated worker | Playwright needs long runtime + browser |
| PDF | `@react-pdf/renderer` | No headless browser for PDF |
| i18n | next-intl | App Router native support |
| Validation | Zod | Shared client/server schemas |
| Tests | Vitest + Playwright | Unit + E2E |

---

## 11. API Versioning & Extensibility

- Rules versioned in `rule_definitions` table
- Merchant API behind adapter interface
- AI behind `AIProvider` interface
- Plan limits in `system_settings` — no code deploy to change prices
