# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @shopping-rescue/web...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY tsconfig.json ./
# pnpm workspace package links live under node_modules/.pnpm — copy store metadata too
COPY --from=deps /app/packages ./packages
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Baked into client + sitemap/robots at build time (Railway runtime env alone is not enough)
ARG NEXT_PUBLIC_APP_URL=https://shoppingrescue.app
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm --filter @shopping-rescue/web build

# Playwright image includes Chromium — required for PDF generation on /api/reports/*/pdf
FROM mcr.microsoft.com/playwright:v1.61.1-noble AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
# Railway injects PORT at runtime (often 8080). Do not force 3000.

# Playwright base image already uses uid/gid 1000/1001 — pick free IDs
RUN groupadd --system --gid 10001 nodejs && \
    useradd --system --uid 10001 --gid nodejs --create-home --home-dir /home/nextjs nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# PDF print route reads these at runtime (not always traced into standalone)
COPY --from=builder --chown=nextjs:nodejs /app/packages/reporting/src/pdf/assets ./packages/reporting/src/pdf/assets
COPY --from=builder --chown=nextjs:nodejs /app/packages/reporting/src/pdf/report.css ./packages/reporting/src/pdf/report.css

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
