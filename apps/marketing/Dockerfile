# Marketing site (TanStack Start / Vite). Build from repo root.
# Dev:  docker build -f apps/marketing/Dockerfile --target dev -t columbus-marketing .
# Prod: docker build -f apps/marketing/Dockerfile --target runtime -t columbus-marketing .

FROM node:26-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack && corepack enable && corepack prepare pnpm@10.12.4 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile --filter marketing...

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/marketing ./apps/marketing
WORKDIR /app/apps/marketing
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @columbusai/db build && pnpm --filter @columbusai/leads build && pnpm run dev --host 0.0.0.0 --port ${PORT:-3000}"]

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/marketing ./apps/marketing
WORKDIR /app/apps/marketing
ARG VITE_API_URL=https://api.columbusai.tech
ARG VITE_CONTACT_EMAIL=contact@columbusai.tech
ARG VITE_BOOKING_LINK=https://cal.com/columbus-ai/30min
ARG VITE_CHAT_TITLE=Chexi AI
ARG VITE_CHAT_WELCOME="I'm Chexi, your Columbus AI assistant. Ask me anything!"
ARG VITE_ADMIN_URL=https://admin.columbusai.tech
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
ENV VITE_BOOKING_LINK=$VITE_BOOKING_LINK
ENV VITE_CHAT_TITLE=$VITE_CHAT_TITLE
ENV VITE_CHAT_WELCOME=$VITE_CHAT_WELCOME
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
RUN pnpm --filter @columbusai/db build && pnpm --filter @columbusai/leads build && pnpm run build

FROM node:26-alpine AS runtime
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/apps/marketing/dist ./dist
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=20s \
  CMD curl -f "http://127.0.0.1:${PORT:-3000}/" || exit 1
CMD ["node", "dist/server/index.mjs"]
