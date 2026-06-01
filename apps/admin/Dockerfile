# Admin dashboard (TanStack Start / Vite). Build from repo root.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm ci

FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/admin ./apps/admin
WORKDIR /app/apps/admin
EXPOSE 3002
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port ${PORT:-3002}"]
