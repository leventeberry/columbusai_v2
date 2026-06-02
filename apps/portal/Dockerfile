# Client portal (TanStack Start / Vite). Build from repo root.
# Dev:  docker build -f apps/portal/Dockerfile --target dev -t columbus-portal .
# Prod: docker build -f apps/portal/Dockerfile --target runtime -t columbus-portal .

FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm ci

FROM node:26-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/portal ./apps/portal
WORKDIR /app/apps/portal
EXPOSE 3001
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port ${PORT:-3001}"]

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/portal ./apps/portal
WORKDIR /app/apps/portal
RUN npm run build

FROM node:26-alpine AS runtime
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/apps/portal/dist ./dist
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=20s \
  CMD curl -f "http://127.0.0.1:${PORT:-3001}/" || exit 1
CMD ["node", "dist/server/index.mjs"]
