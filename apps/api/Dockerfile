# API service — Node 20, build from repo root for workspace deps.
# Build: docker build -f apps/api/Dockerfile -t columbus-api .
# Run:   docker run -p 4000:4000 --env-file .env columbus-api

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY packages/db packages/db
COPY apps/api apps/api
# Use npm install so build works without root package-lock.json; prefer `npm ci` when lockfile exists.
COPY package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages/db ./packages/db
COPY --from=deps /app/apps/api ./apps/api
RUN cd apps/api && npm run build

FROM node:20-alpine AS runtime
RUN apk add --no-cache curl
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/db ./packages/db
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=5s \
  CMD curl -f http://localhost:4000/api/health || exit 1
# Default: run API server. Override with e.g. sh -c "cd /app/packages/db && npx prisma migrate deploy" for migrate job.
CMD ["node", "apps/api/dist/index.js"]
