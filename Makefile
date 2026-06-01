# Docker compose files (run from repo root).
COMPOSE_DEV  = docker compose -f infra/docker/compose.dev.yml

# Database migrations: single source of truth is packages/db. Run from repo root.
.PHONY: db-migrate db-migrate-dev db-generate
db-migrate:
	cd packages/db && npx prisma migrate deploy
db-migrate-dev:
	cd packages/db && npx prisma migrate dev
db-generate:
	cd packages/db && npx prisma generate

# Run load test against local stack (dev or prod compose).
# Ensure web is up (e.g. make up).
BASE_URL ?= http://localhost:3000
CONCURRENCY ?= 10
REQUESTS ?= 100

.PHONY: load-test load-test-dev 
load-test:
	cd apps/web && BASE_URL="$(BASE_URL)" CONCURRENCY="$(CONCURRENCY)" REQUESTS="$(REQUESTS)" CONVERSATION_ID="$(CONVERSATION_ID)" SPOOF_IPS="$(SPOOF_IPS)" npx tsx ../../infra/scripts/load-chat.ts

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

n8n-url:
	@echo "n8n URL: http://localhost:5678"
	@echo "Basic auth user: $${N8N_BASIC_AUTH_USER:-admin}"

hermes:
	npm run hermes -- "$(TASK)"

# Local dev (host, no Docker)
.PHONY: dev-marketing dev-portal dev-admin
dev-marketing:
	cd apps/marketing && npm run dev

dev-portal:
	cd apps/portal && PORT=3001 npm run dev -- --port 3001

dev-admin:
	cd apps/admin && PORT=3002 npm run dev -- --port 3002

