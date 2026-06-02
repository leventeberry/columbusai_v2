# Docker compose files (run from repo root).
COMPOSE_DEV  = docker compose -f infra/docker/compose.dev.yml
COMPOSE_PROD = docker compose -f infra/docker/compose.prod.yml

# Database migrations: single source of truth is packages/db. Run from repo root.
.PHONY: db-migrate db-migrate-dev db-generate
db-migrate:
	pnpm db:migrate:deploy
db-migrate-dev:
	pnpm --filter @columbusai/db exec prisma migrate dev
db-generate:
	pnpm db:generate

# Run load test against local stack (dev or prod compose).
# Ensure web is up (e.g. make up).
BASE_URL ?= http://localhost:3000
CONCURRENCY ?= 10
REQUESTS ?= 100

.PHONY: load-test load-test-dev 
load-test:
	cd apps/web && BASE_URL="$(BASE_URL)" CONCURRENCY="$(CONCURRENCY)" REQUESTS="$(REQUESTS)" CONVERSATION_ID="$(CONVERSATION_ID)" SPOOF_IPS="$(SPOOF_IPS)" pnpm exec tsx ../../infra/scripts/load-chat.ts

load-test-dev: load-test


# --- Docker (dev) ---
.PHONY: build-marketing build-web up-dev up down n8n-url hermes
build-marketing:
	$(COMPOSE_DEV) build marketing

build-web:
	$(COMPOSE_DEV) --profile legacy build web

up-dev:
	$(COMPOSE_DEV) up --build

up:
	$(COMPOSE_DEV) up -d

down:
	$(COMPOSE_DEV) down

# --- Docker (production) ---
.PHONY: build-prod up-prod down-prod verify-prod
build-prod:
	$(COMPOSE_PROD) build

up-prod:
	$(COMPOSE_PROD) up -d --build

down-prod:
	$(COMPOSE_PROD) down

verify-prod:
	./infra/scripts/verify-prod-deploy.sh

n8n-url:
	@echo "n8n URL: http://localhost:5678"
	@echo "Basic auth user: $${N8N_BASIC_AUTH_USER:-admin}"

hermes:
	pnpm run hermes -- "$(TASK)"

# Local dev (host, no Docker)
.PHONY: dev-marketing dev-portal dev-admin
dev-marketing:
	pnpm --filter marketing dev

dev-portal:
	PORT=3001 pnpm --filter portal dev -- --port 3001

dev-admin:
	PORT=3002 pnpm --filter admin dev -- --port 3002
