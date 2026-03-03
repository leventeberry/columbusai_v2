# Phase 5 production Dockerfile — multi-stage, workspace-aware.
# Build from repo root: docker build -f apps/web/Dockerfile -t columbus-web .
# Context must be repo root (so package.json + package-lock.json + workspaces are available).

# --- deps (workspace root) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm ci

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
# Generate Prisma client from shared db package (no prisma in apps/web)
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
WORKDIR /app/apps/web
RUN npx next build --webpack
# Next may externalize @prisma/client with a hash; replace hashed dir with symlink to real client
RUN for d in /app/node_modules/@prisma/client-*; do [ -d "$d" ] && rm -rf "$d" && ln -sf /app/node_modules/@prisma/client "$d" && break; done 2>/dev/null || true

# --- runtime ---
FROM node:20-alpine AS runtime
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/next.config.ts ./
COPY --from=build /app/apps/web/public ./public

# Next.js may externalize @prisma/client with a hash; symlink created in build stage
EXPOSE 3000

CMD ["npm", "run", "start"]

# --- dev (docker compose dev: target=dev) ---
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]
