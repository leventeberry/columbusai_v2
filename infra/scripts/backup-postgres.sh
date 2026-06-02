#!/usr/bin/env bash
# Backup Columbus Postgres (all logical DBs in the server).
# Usage:
#   ./infra/scripts/backup-postgres.sh
#   BACKUP_DIR=/var/backups/columbus RETENTION_DAYS=14 ./infra/scripts/backup-postgres.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${ROOT}/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT}/infra/docker/compose.prod.yml}"

mkdir -p "${BACKUP_DIR}"

if docker compose -f "${COMPOSE_FILE}" ps postgres --status running &>/dev/null; then
  OUT="${BACKUP_DIR}/columbus-${TIMESTAMP}.sql.gz"
  docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dumpall -U "${POSTGRES_USER:-columbus}" | gzip -9 > "${OUT}"
  echo "Wrote ${OUT}"
else
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "postgres container not running and DATABASE_URL is unset" >&2
    exit 1
  fi
  OUT="${BACKUP_DIR}/columbus-${TIMESTAMP}.sql.gz"
  pg_dump "${DATABASE_URL}" | gzip -9 > "${OUT}"
  echo "Wrote ${OUT} (from DATABASE_URL)"
fi

find "${BACKUP_DIR}" -name 'columbus-*.sql.gz' -type f -mtime +"${RETENTION_DAYS}" -delete 2>/dev/null || true
