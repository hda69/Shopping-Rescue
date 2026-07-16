# Shopping Rescue

Independent SaaS for Google Merchant Center diagnostics — scan storefronts, detect policy issues, and generate actionable reports.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Docker** (for local PostgreSQL and containerized services)

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> shopping-rescue
cd shopping-rescue
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Supabase, Stripe, and other credentials
```

For local development without Supabase, set `DATABASE_URL` to the Docker Postgres default:

```
DATABASE_URL=postgresql://shopping_rescue:shopping_rescue@localhost:5432/shopping_rescue
```

### 3. Start infrastructure

```bash
docker compose up -d postgres
```

### 4. Run database migrations

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start development servers

```bash
pnpm dev
```

This runs the web app and worker concurrently via Turborepo.

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| Worker health | http://localhost:3001/health |

### 6. Verify worker health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{ "status": "ok", "queuedJobCount": 0 }
```

## Docker (full stack)

Run PostgreSQL, web, and worker together:

```bash
docker compose up -d
```

> **Note:** The `web` service requires `apps/web/Dockerfile`. For local dev, prefer `pnpm dev` instead of Docker for the web app.

## Project structure

```
shopping-rescue/
├── apps/
│   ├── web/          # Next.js 15 App Router
│   └── worker/       # Background job processor (Playwright)
├── packages/
│   ├── database/     # Drizzle ORM, migrations, job queue
│   ├── shared/       # Types, validation, logging, config
│   └── ...           # auth, billing, scanner, etc.
├── docs/             # Architecture, security, product spec
├── docker-compose.yml
└── .env.example
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript check across monorepo |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed development data |
| `pnpm db:reset` | Reset database (destructive) |

## Worker

The worker polls PostgreSQL for queued jobs every 2 seconds using `FOR UPDATE SKIP LOCKED`. It handles graceful shutdown on `SIGTERM`/`SIGINT` — finishing the current job before exit.

Registered job handlers:

| Job type | Status |
|----------|--------|
| `FREE_SITE_SCAN` | Placeholder (logs + completes) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full job lifecycle and handler roadmap.

## Staging deployment

See [docs/DEPLOYMENT-STAGING.md](docs/DEPLOYMENT-STAGING.md) for Railway setup (PostgreSQL + web + worker).

## Documentation

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Staging deployment](docs/DEPLOYMENT-STAGING.md)

## License

Private — all rights reserved.
