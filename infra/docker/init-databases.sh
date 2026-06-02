#!/bin/bash
# First-time cluster init: create n8n + columbus_vectors DBs (columbus from POSTGRES_DB).
# Mounted in postgres service docker-entrypoint-initdb.d — runs only on empty data volume.
set -e
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-columbus}" -d postgres <<-EOSQL
  CREATE DATABASE n8n OWNER ${POSTGRES_USER:-columbus};
  CREATE DATABASE columbus_vectors OWNER ${POSTGRES_USER:-columbus};
EOSQL
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-columbus}" -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
