# Run load test against local stack (dev or prod compose).
# Ensure web is up (e.g. docker compose -f infra/docker/compose.dev.yml up -d).
BASE_URL ?= http://localhost:3000
CONCURRENCY ?= 10
REQUESTS ?= 100

.PHONY: load-test load-test-dev load-test-prod
load-test:
	cd apps/web && BASE_URL="$(BASE_URL)" CONCURRENCY="$(CONCURRENCY)" REQUESTS="$(REQUESTS)" CONVERSATION_ID="$(CONVERSATION_ID)" SPOOF_IPS="$(SPOOF_IPS)" npx tsx ../../infra/scripts/load-chat.ts

load-test-dev: load-test

load-test-prod: load-test
