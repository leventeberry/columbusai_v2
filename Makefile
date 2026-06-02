# Columbus AI — Makefile
# Run from repo root. Each environment uses its own env file + compose file.
#
#   make help          — list targets
#   make up            — local dev stack (.env.local)
#   make smoke         — health checks (local)
#   make up-staging    — staging stack (.env.staging)
#   make up-prod       — production stack (.env.production)

# --- Compose + env per environment ---
ENV_LOCAL      := .env.local
ENV_STAGING    := .env.staging
ENV_PRODUCTION := .env.production

COMPOSE_DEV  = docker compose --env-file $(ENV_LOCAL) -f infra/docker/compose.dev.yml
COMPOSE_STG  = docker compose --env-file $(ENV_STAGING) -f infra/docker/compose.staging.yml
COMPOSE_PROD = docker compose --env-file $(ENV_PRODUCTION) -f infra/docker/compose.prod.yml

# --- Database (packages/db) ---
.PHONY: db-migrate db-migrate-dev db-generate
db-migrate:
	COLUMBUS_ENV=local pnpm db:migrate:deploy

db-migrate-dev:
	COLUMBUS_ENV=local pnpm --filter @columbusai/db exec prisma migrate dev

db-generate:
	pnpm db:generate

# --- Env validation ---
.PHONY: env-check env-sync help
env-check:
	pnpm env:check

env-sync:
	pnpm env:sync-examples

define require_env
	@test -f $(1) || (echo "Missing $(1). Copy from $(1).example and set secrets." && exit 1)
endef

# --- Help ---
.PHONY: help
help:
	@echo "Columbus AI — common targets"
	@echo ""
	@echo "  Local (Docker dev):"
	@echo "    make up              Start stack detached (.env.local)"
	@echo "    make up-dev          Start stack foreground + build"
	@echo "    make down            Stop local stack"
	@echo "    make restart         down + up + smoke"
	@echo "    make smoke           HTTP health checks"
	@echo "    make ps              Container status"
	@echo "    make logs            Tail all service logs"
	@echo "    make n8n-local-up    postgres + redis + n8n + api only"
	@echo ""
	@echo "  Staging:"
	@echo "    make up-staging      Start staging stack (.env.staging)"
	@echo "    make down-staging    Stop staging stack"
	@echo "    make smoke-staging   Validate compose config"
	@echo ""
	@echo "  Production:"
	@echo "    make up-prod         Start prod stack (.env.production)"
	@echo "    make down-prod       Stop prod stack"
	@echo "    make verify-prod     Build prod images + smoke test"
	@echo ""
	@echo "  Env:"
	@echo "    make env-check       Verify .env.*.example key parity"
	@echo "    make env-sync        Regenerate .env.*.example from env/profiles.ts"
	@echo ""
	@echo "  Host dev (no Docker):"
	@echo "    make dev-marketing | dev-portal | dev-admin"

# --- Local Docker ---
.PHONY: config-dev build build-marketing build-web up up-dev down restart ps logs smoke smoke-local
config-dev:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) config --quiet

build: build-marketing

build-marketing:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) build marketing

build-web:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) --profile legacy build web

up-dev:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) up --build

up:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) up -d --build

down:
	$(COMPOSE_DEV) down

restart: down up smoke-local

ps:
	$(COMPOSE_DEV) ps

logs:
	$(COMPOSE_DEV) logs -f --tail=100

smoke: smoke-local

smoke-local:
	@./infra/scripts/smoke-dev.sh

# --- Staging ---
.PHONY: config-staging build-staging up-staging down-staging smoke-staging
config-staging:
	$(call require_env,$(ENV_STAGING))
	$(COMPOSE_STG) config --quiet

build-staging:
	$(call require_env,$(ENV_STAGING))
	$(COMPOSE_STG) build

up-staging:
	$(call require_env,$(ENV_STAGING))
	$(COMPOSE_STG) up -d --build

down-staging:
	$(COMPOSE_STG) down

smoke-staging: config-staging
	@echo "Staging compose config OK (.env.staging)"

# --- Production ---
.PHONY: config-prod build-prod up-prod down-prod verify-prod smoke-prod
config-prod:
	$(call require_env,$(ENV_PRODUCTION))
	$(COMPOSE_PROD) config --quiet

build-prod:
	$(call require_env,$(ENV_PRODUCTION))
	$(COMPOSE_PROD) build

up-prod:
	$(call require_env,$(ENV_PRODUCTION))
	$(COMPOSE_PROD) up -d --build

down-prod:
	$(COMPOSE_PROD) down

verify-prod:
	./infra/scripts/verify-prod-deploy.sh

smoke-prod: config-prod
	@echo "Production compose config OK (.env.production)"

# --- n8n local workflow dev ---
.PHONY: n8n-url n8n-local-up n8n-local-bootstrap
n8n-url:
	@echo "n8n URL: http://localhost:5678"
	@echo "Basic auth user: $${N8N_BASIC_AUTH_USER:-admin}"

n8n-local-up:
	$(call require_env,$(ENV_LOCAL))
	$(COMPOSE_DEV) up -d postgres redis ensure-databases n8n api
	@echo ""
	@echo "Local stack: n8n http://localhost:5678  api http://localhost:4000"
	@echo "Next: pnpm n8n:doctor && pnpm n8n:bootstrap-local"

n8n-local-bootstrap:
	pnpm n8n:bootstrap-local

# --- Hermes ---
.PHONY: hermes
hermes:
	pnpm run hermes -- "$(TASK)"

# --- Load test ---
BASE_URL ?= http://localhost:3000
CONCURRENCY ?= 10
REQUESTS ?= 100

.PHONY: load-test load-test-dev
load-test:
	cd apps/web && BASE_URL="$(BASE_URL)" CONCURRENCY="$(CONCURRENCY)" REQUESTS="$(REQUESTS)" CONVERSATION_ID="$(CONVERSATION_ID)" SPOOF_IPS="$(SPOOF_IPS)" pnpm exec tsx ../../infra/scripts/load-chat.ts

load-test-dev: load-test

# --- Host dev (no Docker) ---
.PHONY: dev-marketing dev-portal dev-admin dev-api
dev-marketing:
	pnpm --filter marketing dev

dev-portal:
	PORT=3001 pnpm --filter portal dev -- --port 3001

dev-admin:
	PORT=3002 pnpm --filter admin dev -- --port 3002

dev-api:
	pnpm --filter api dev

.DEFAULT_GOAL := help
