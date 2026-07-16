# Shopping Rescue — Security

> Version: 1.0.0 · Last updated: 2026-07-12

## 1. Security Principles

1. **Defense in depth** — multiple layers; no single point of failure
2. **Least privilege** — minimal scopes, roles, and API access
3. **Fail secure** — deny by default; explicit grants only
4. **No secrets in client** — all keys server-side only
5. **Audit everything sensitive** — auth, billing, OAuth, admin actions
6. **Assume breach** — encrypt tokens at rest; limit blast radius via RLS

---

## 2. Authentication

### Supabase Auth

| Control | Implementation |
|---|---|
| Password storage | Delegated to Supabase (bcrypt) |
| Session tokens | JWT in `httpOnly`, `Secure`, `SameSite=Lax` cookies |
| Session refresh | Server-side via `@supabase/ssr` |
| Brute force | Supabase rate limits + app-level IP rate limiting |
| Magic links | Single-use, time-limited |

### Google OAuth (Merchant Center)

| Control | Implementation |
|---|---|
| Flow | Authorization Code (server-side) |
| Scope | `https://www.googleapis.com/auth/content` only |
| Offline access | `access_type=offline`, `prompt=consent` on first connect |
| CSRF | `state` parameter stored in session, validated on callback |
| PKCE | Used when library supports it |
| Token storage | Refresh token encrypted AES-256-GCM before DB insert |
| Token rotation | Re-encrypt on refresh; revoke on disconnect |
| Never log | Access tokens, refresh tokens, authorization codes |

---

## 3. Authorization

### Role-based access

| Role | Permissions |
|---|---|
| `user` | Own profile, org membership |
| `owner` | Full org: sites, scans, billing, members |
| `member` | Read scans, trigger scans, no billing |
| `admin` | System settings, all orgs, job management |

### Row Level Security

- All tenant tables enforce `organization_id` isolation
- `scan_jobs`, `webhook_events` — service role only (no client policies)
- Admin routes check `users.role = 'admin'` server-side

### API route protection

```typescript
// Every mutation:
1. Validate session (Supabase)
2. Validate CSRF token
3. Validate input (Zod)
4. Check organization membership
5. Check plan entitlements
6. Rate limit
7. Audit log (sensitive actions)
```

---

## 4. Input Validation

| Layer | Tool |
|---|---|
| Client forms | Zod + react-hook-form |
| API routes | Zod (same schemas from `@shopping-rescue/shared`) |
| Webhooks | Stripe signature verification + Zod payload parsing |
| Database | Parameterized queries only (Drizzle ORM) |

### URL validation (SSRF prevention)

```
1. Parse URL → reject non-http(s) schemes
2. Resolve DNS → reject private IPs (10.x, 172.16-31.x, 192.168.x, 127.x, ::1, link-local)
3. Block localhost, 0.0.0.0, metadata endpoints (169.254.169.254)
4. Re-validate after each redirect (max 5 redirects)
5. Timeout per request (30s default)
6. Max response size (5MB default)
7. Max concurrent requests per scan (3)
```

Implemented in `packages/scanner/src/url-validator.ts` with unit tests.

---

## 5. HTTP Security Headers

Applied via Next.js middleware:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 6. CSRF Protection

| Context | Method |
|---|---|
| Server Actions | Next.js built-in origin check |
| API routes (mutations) | Double-submit cookie or `X-CSRF-Token` header |
| Stripe webhooks | Signature verification (not CSRF-vulnerable) |
| OAuth callbacks | `state` parameter validation |

---

## 7. Rate Limiting

| Endpoint | Limit |
|---|---|
| Free scan submission | 3 per IP per hour |
| Login attempts | 5 per email per 15 min |
| API routes (general) | 100 per user per minute |
| Manual re-scan | Plan-dependent (e.g. 2/day for Monitoring Pro) |
| Webhook processing | No limit (verified source) |

Implementation: in-memory for dev, Upstash Redis for production.

---

## 8. Stripe Security

| Control | Implementation |
|---|---|
| Webhook verification | `stripe.webhooks.constructEvent()` with signing secret |
| Idempotency | `webhook_events` table with unique `(provider, event_id)` |
| Plan activation | **Only** via webhook processing, never redirect |
| Customer data | Stripe Customer ID stored; no card data touches our servers |
| Billing Portal | Server-created session with return URL |

---

## 9. Encryption

### Refresh tokens (Google OAuth)

```
Algorithm: AES-256-GCM
Key: TOKEN_ENCRYPTION_KEY env var (32 bytes, base64)
Storage: refresh_token_enc column (iv:authTag:ciphertext, base64)
Rotation: Support key versioning via TOKEN_ENCRYPTION_KEY_PREVIOUS
```

### General secrets

| Secret | Storage |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server env only |
| `STRIPE_SECRET_KEY` | Server env only |
| `STRIPE_WEBHOOK_SECRET` | Server env only |
| `GOOGLE_CLIENT_SECRET` | Server env only |
| `TOKEN_ENCRYPTION_KEY` | Server env only |
| `RESEND_API_KEY` | Server env only |
| `OPENAI_API_KEY` | Server env only (optional) |

Never in: client bundles, database plaintext, logs, error reports.

---

## 10. Crawler Security

| Threat | Mitigation |
|---|---|
| SSRF | URL validator (see §4) |
| Resource exhaustion | Plan limits, timeouts, concurrency caps |
| Malicious pages | No form submission, no checkout, no file download |
| Data leakage | Transparent user-agent identifying Shopping Rescue |
| Private pages | Skip URLs matching account/cart/checkout patterns |

User-agent string:
```
ShoppingRescueBot/1.0 (+https://shoppingrescue.com/bot; diagnostic crawler)
```

---

## 11. AI Security

| Control | Implementation |
|---|---|
| Structured output | Zod validation on every LLM response |
| Token limits | Max tokens per call configurable |
| Data minimization | Strip PII, OAuth tokens, payment data before prompt |
| No tool calling | LLM has no function/tool access |
| No web browsing | LLM cannot access external URLs |
| Fallback | Deterministic result if AI fails or times out |
| Logging | Model, latency, token count, cost — no prompt content in prod logs |
| Labeling | `is_ai_assisted: true` on findings using AI |

---

## 12. XSS & HTML Sanitization

| Context | Method |
|---|---|
| User-generated content | DOMPurify server-side before storage |
| Report rendering | React auto-escaping; no `dangerouslySetInnerHTML` without sanitization |
| Email templates | React Email (static, no user input in HTML) |
| PDF generation | Templated content only |

---

## 13. GDPR & Data Protection

| Right | Implementation |
|---|---|
| Consent | Cookie banner + explicit checkboxes |
| Access | Data export API (JSON download) |
| Erasure | Account deletion flow → `DELETE_EXPIRED_DATA` + audit log |
| OAuth revocation | Google token revoke API on disconnect |
| Retention | Configurable per data type (see PRODUCT_SPEC §7) |
| DPA | Documented in privacy policy |
| EU hosting | Supabase EU region option documented |

### Deletion flow

```
1. User requests deletion in settings
2. Cancel Stripe subscription (if active)
3. Revoke Google OAuth tokens
4. Enqueue DELETE_EXPIRED_DATA with org_id
5. Soft-delete org + hard-delete after grace period
6. Delete Supabase Storage files
7. Send confirmation email
8. Log in audit_logs
```

---

## 14. Logging Policy

### Never log

- Access tokens, refresh tokens
- Stripe secrets, webhook raw bodies in production
- Full cookie contents
- Passwords, payment card data
- Full page HTML content
- AI prompts containing PII

### Always log (structured JSON)

- Request ID / correlation ID
- User ID (UUID, not email)
- Organization ID
- Action type
- Resource type + ID
- Duration
- Status code
- Error type (not stack in production responses)

---

## 15. Dependency Security

- `pnpm audit` in CI
- Dependabot or Renovate for updates
- Lock file committed
- No beta/deprecated packages when stable exists

---

## 16. Incident Response

| Severity | Response |
|---|---|
| Token leak | Rotate key, revoke all sessions, audit access |
| SSRF exploit | Block IP range, review crawler logs, patch validator |
| Webhook replay | Idempotency table prevents double-processing |
| Data breach | Notify within 72h (GDPR), audit_logs for scope |

---

## 17. Security Checklist (MVP)

- [ ] All env vars documented in `.env.example`, none in client
- [ ] RLS enabled on all tenant tables
- [ ] SSRF validator with unit tests
- [ ] Stripe webhook signature verification
- [ ] OAuth state validation
- [ ] Refresh tokens encrypted
- [ ] CSP headers configured
- [ ] CSRF on mutations
- [ ] Rate limiting on public endpoints
- [ ] Audit logs for admin + billing + OAuth actions
- [ ] No secrets in Sentry reports (beforeSend filter)
- [ ] HTTPS enforced in production
- [ ] Cookie flags: Secure, HttpOnly, SameSite
