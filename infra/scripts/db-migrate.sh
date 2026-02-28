#!/usr/bin/env bash
# Run Prisma migrations (deploy). Chat DB only (DATABASE_URL); vector DB has no Prisma migrations.
# DATABASE_URL from apps/web/.env or repo root .env.
# From repo root: ./infra/scripts/db-migrate.sh
# With Docker Compose: docker compose -f infra/docker/compose.dev.yml exec web npm run db:migrate
set -e
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
if [ -f apps/web/.env ]; then set -a; source apps/web/.env; set +a
elif [ -f .env ]; then set -a; source .env; set +a; fi
npm run db:migrate --prefix apps/web
