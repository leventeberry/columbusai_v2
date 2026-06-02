#!/usr/bin/env bash
# Deprecated: prefer `make up` or `make up-dev` from repo root.
set -e
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
docker compose --env-file .env.local -f infra/docker/compose.dev.yml up --build "$@"
