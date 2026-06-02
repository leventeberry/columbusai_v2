#!/bin/sh
# Idempotent: create n8n + columbus_vectors if missing (existing columbus_pgdata volumes).
set -e
USER="${POSTGRES_USER:-columbus}"
HOST="${PGHOST:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD:-columbus}"
until pg_isready -h "$HOST" -U "$USER" -d postgres; do sleep 1; done

exists() {
  psql -h "$HOST" -U "$USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$1'" | grep -q 1
}

if ! exists n8n; then
  psql -h "$HOST" -v ON_ERROR_STOP=1 -U "$USER" -d postgres -c "CREATE DATABASE n8n OWNER $USER;"
fi
if ! exists columbus_vectors; then
  psql -h "$HOST" -v ON_ERROR_STOP=1 -U "$USER" -d postgres -c "CREATE DATABASE columbus_vectors OWNER $USER;"
  psql -h "$HOST" -v ON_ERROR_STOP=1 -U "$USER" -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
else
  psql -h "$HOST" -v ON_ERROR_STOP=1 -U "$USER" -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
fi
