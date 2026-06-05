#!/usr/bin/env bash
# Capture install, dependency, and build health logs for maintenance review.
# Usage: ./scripts/maintenance/audit-deps.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$REPO_ROOT/logs/maintenance"
COMPOSE="docker compose --env-file .env.local -f infra/docker/compose.dev.yml"

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

echo "==> logs -> $LOG_DIR"

run() {
  local name="$1"
  shift
  echo "  $name"
  "$@" >"$LOG_DIR/$name.log" 2>&1 || echo "  (exit $? — see $name.log)" >&2
}

run pnpm-install env -u CI pnpm install
run pnpm-outdated pnpm outdated -r
run pnpm-audit pnpm audit
run typecheck pnpm typecheck
run lint pnpm lint
run build pnpm build
run docker-build $COMPOSE build

echo ""
echo "Done. Review logs in logs/maintenance/ and docs/standards/maintenance.md"
