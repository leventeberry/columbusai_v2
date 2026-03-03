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
.PHONY: build-web up down
build-web:
	$(COMPOSE_DEV) build web

up:
	$(COMPOSE_DEV) up -d

down:
	$(COMPOSE_DEV) down

