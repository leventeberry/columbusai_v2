#!/bin/bash
# Legacy: separate postgres-vectors container. Use init-databases.sh / ensure-databases.sh on unified postgres.
# Use POSTGRES_USER (e.g. columbus) since the image may not create a "postgres" role.
set -e
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
