FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker

RUN pnpm install --filter @shopping-rescue/worker...

WORKDIR /app/apps/worker

ENV NODE_ENV=production
# Railway injects PORT at runtime; this is only a local/default fallback.
ENV WORKER_HEALTH_PORT=3001

# Railway public proxy uses $PORT — do not hardcode EXPOSE to a fixed private port only.
EXPOSE 3001

# Direct start (avoids pnpm wrapper hang / missing logs on some hosts)
CMD ["pnpm", "exec", "tsx", "src/server.ts"]
