#!/bin/bash
# Legacy: for single-instance setup only (one Postgres with two DBs).
# Current compose uses the postgres-vectors service and init-vector-extension.sh instead.
# Create RAG vector database and enable pgvector (runs in postgres container init).
# Uses postgres superuser; columbus_vectors is owned by columbus for app access.
set -e
psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c "CREATE DATABASE columbus_vectors OWNER columbus;"
psql -v ON_ERROR_STOP=1 -U postgres -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
