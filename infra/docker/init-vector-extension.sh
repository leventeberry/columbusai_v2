#!/bin/bash
# Enable pgvector in the vectors DB (postgres-vectors service uses POSTGRES_DB=columbus_vectors).
# Use POSTGRES_USER (e.g. columbus) since the image may not create a "postgres" role.
set -e
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
