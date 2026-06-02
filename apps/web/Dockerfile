# Legacy Next.js web app. Build from repo root with pnpm.
# docker build -f apps/web/Dockerfile -t columbus-web .

FROM node:26-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack && corepack enable && corepack prepare pnpm@10.12.4 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages ./packages
COPY apps ./apps
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/columbusai?schema=public"
RUN pnpm install --frozen-lockfile --filter web...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/columbusai?schema=public"
RUN pnpm --filter @columbusai/db build
WORKDIR /app/apps/web
RUN pnpm exec next build --webpack
RUN for d in /app/node_modules/@prisma/client-*; do [ -d "$d" ] && rm -rf "$d" && ln -sf /app/node_modules/@prisma/client "$d" && break; done 2>/dev/null || true

FROM node:26-alpine AS runtime
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/next.config.ts ./
COPY --from=build /app/apps/web/public ./public
EXPOSE 3000
CMD ["pnpm", "run", "start"]

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/columbusai?schema=public"
RUN pnpm --filter @columbusai/db build
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
