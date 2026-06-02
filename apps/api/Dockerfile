# API service — Node 26 + pnpm. Build from repo root.
# Build: docker build -f apps/api/Dockerfile -t columbus-api .
# Run:   docker run -p 4000:4000 --env-file .env columbus-api

FROM node:26-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack && corepack enable && corepack prepare pnpm@10.12.4 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages/db/package.json packages/db/
COPY packages/leads/package.json packages/leads/
COPY apps/api/package.json apps/api/tsconfig.json apps/api/
COPY apps/api/src apps/api/src
COPY packages/db/prisma.config.ts packages/db/
COPY packages/db/prisma packages/db/prisma
COPY packages/db/tsconfig.build.json packages/db/
COPY packages/db/scripts packages/db/scripts
COPY packages/db/src packages/db/src
COPY packages/leads/tsconfig.json packages/leads/
COPY packages/leads/src packages/leads/src
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/columbusai?schema=public"
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/.npmrc ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/api ./apps/api
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/columbusai?schema=public"
RUN pnpm --filter @columbusai/db build && pnpm --filter @columbusai/leads build && pnpm --filter api build

FROM node:26-alpine AS runtime
RUN apk add --no-cache curl
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/db/package.json ./packages/db/
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/leads/package.json ./packages/leads/
COPY --from=build /app/packages/leads/dist ./packages/leads/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=5s \
  CMD curl -f http://localhost:4000/api/health || exit 1
CMD ["node", "apps/api/dist/index.js"]
