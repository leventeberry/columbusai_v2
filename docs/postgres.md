# Postgres (unified pgvector)

One Postgres instance (`pgvector/pgvector:pg16`) on port **5432** with three logical databases:

| Database | Purpose |
|----------|---------|
| `columbus` | Platform — Prisma, leads, chat (`DATABASE_URL`) |
| `columbus_vectors` | RAG — pgvector extension (`VECTOR_DATABASE_URL`) |
| `n8n` | Local n8n workflow metadata (`DB_POSTGRESDB_*` in compose) |

Fresh installs: `init-databases.sh` runs on first empty volume via `docker-entrypoint-initdb.d`. Existing volumes: the `ensure-databases` one-shot service (or manual SQL below) creates missing DBs idempotently.

## URLs

| Context | Platform | Vector | n8n |
|---------|----------|--------|-----|
| Docker (in network) | `@postgres:5432/columbus` | `@postgres:5432/columbus_vectors` | `@postgres:5432/n8n` |
| Host (mapped port) | `@localhost:5432/columbus` | `@localhost:5432/columbus_vectors` | `@localhost:5432/n8n` |

## Existing `columbus_pgdata` volume (one-time)

If Postgres was created before unified setup, entrypoint init scripts do **not** re-run. Either:

```bash
docker compose -f infra/docker/compose.dev.yml run --rm ensure-databases
```

Or manually:

```bash
docker compose -f infra/docker/compose.dev.yml exec postgres psql -U columbus -d postgres -c "CREATE DATABASE n8n OWNER columbus;"
docker compose -f infra/docker/compose.dev.yml exec postgres psql -U columbus -d postgres -c "CREATE DATABASE columbus_vectors OWNER columbus;"
docker compose -f infra/docker/compose.dev.yml exec postgres psql -U columbus -d columbus_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

(Skip `CREATE DATABASE` lines if the database already exists.)

## Verify

```bash
docker compose -f infra/docker/compose.dev.yml exec postgres \
  psql -U columbus -d postgres -c "SELECT datname FROM pg_database ORDER BY datname;"

docker compose -f infra/docker/compose.dev.yml exec postgres \
  psql -U columbus -d columbus_vectors -c "\dx vector"

docker compose -f infra/docker/compose.dev.yml exec postgres \
  psql -U columbus -d n8n -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' LIMIT 10;"
```

After n8n starts with `DB_TYPE=postgresdb`, expect tables such as `workflow_entity`, `execution_entity`.

## n8n: SQLite → Postgres (local)

1. Export workflows from n8n UI (or back up the `n8n_data` volume).
2. Ensure the `n8n` database exists (`ensure-databases` or SQL above).
3. Recreate n8n with Postgres env (compose.dev.yml sets `DB_POSTGRESDB_*`).
4. n8n runs schema migrations on first start; re-import workflows if needed.
5. Confirm `database.sqlite` in the volume is no longer used for new data (optional: remove the file after verifying workflows in the UI).

Fresh dev with no workflows: restart n8n; empty `n8n` DB is fine.

### Vector data from removed `postgres-vectors` container

If you previously ran a separate `postgres-vectors` service, copy schema/data once:

```bash
docker exec <old-postgres-vectors-container> pg_dump -U columbus -d columbus_vectors --no-owner \
  | docker compose -f infra/docker/compose.dev.yml exec -T postgres psql -U columbus -d columbus_vectors
```

Then stop the orphan container: `docker compose -f infra/docker/compose.dev.yml up -d --remove-orphans`.

## Production

Root `docker-compose.yml` includes [compose.prod.yml](../infra/docker/compose.prod.yml). Production uses self-hosted n8n with metadata in the `n8n` database. See [deployment-runbook.md](deployment-runbook.md).
