FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker

RUN pnpm install

WORKDIR /app/apps/worker

ENV NODE_ENV=production
ENV WORKER_HEALTH_PORT=3001

EXPOSE 3001

CMD ["pnpm", "start"]
