# Phase 5 production Dockerfile — multi-stage, no dev behavior.
# Build from repo root: docker build -f apps/web/Dockerfile -t columbus-web .
# Supports: CMD (next start) for web; override with npx prisma migrate deploy for migrate service.

# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
# Use webpack (not Turbopack) so @prisma/client resolves at runtime in the image
RUN npx next build --webpack

# --- runtime ---
FROM node:20-alpine AS runtime
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public

# Next.js externalizes @prisma/client with a hash; symlink so require() resolves at runtime
RUN ln -sf /app/node_modules/@prisma/client /app/node_modules/@prisma/client-6806b234b4f49db7

EXPOSE 3000

CMD ["npm", "run", "start"]
