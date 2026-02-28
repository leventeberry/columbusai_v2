#!/usr/bin/env bash
# Phase 0: stop dev compose (run from repo root or any dir)
set -e
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
docker compose -f infra/docker/compose.dev.yml down "$@"
