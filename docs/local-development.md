# Local development

Canonical workflow for running Columbus AI on your laptop with Docker.

## Prerequisites

- Node **26+** and pnpm 10 (`corepack enable && corepack prepare pnpm@10.12.4 --activate`)
- Docker Compose v2
- Repo cloned locally

## First-time setup

```bash
cp .env.local.example .env.local
# Edit .env.local — at minimum set OPENAI_API_KEY and any secrets you need

pnpm install
make up
make smoke
```

Optional n8n workflow sync:

```bash
pnpm n8n:doctor
pnpm n8n:bootstrap-local
```

See [n8n-local-dev.md](n8n-local-dev.md).

## Daily commands

| Command | Purpose |
|---------|---------|
| `make up` | Start full stack (detached) |
| `make down` | Stop stack |
| `make restart` | Recycle stack + smoke |
| `make smoke` | Verify API, apps, Postgres, Redis, n8n |
| `make verify` | CI checks + smoke |
| `make logs` | Tail service logs |
| `make ps` | Container status |
| `make up-dev` | Foreground logs (debugging) |

Host-only app dev (Postgres/API still in Docker):

```bash
make dev-marketing   # :3000
make dev-portal      # :3001
make dev-admin       # :3002
make dev-api         # :4000
```

## Service URLs (local)

| Service | URL |
|---------|-----|
| Marketing | http://localhost:3000 |
| Portal | http://localhost:3001 |
| Admin | http://localhost:3002 |
| API | http://localhost:4000 |
| n8n | http://localhost:5678 |

## Health checks

```bash
curl -sf http://localhost:4000/api/health
# {"ok":true,"database":"up"}

make smoke
```

## Environment files

Local Docker uses [`.env.local`](../.env.local.example). Staging and production use separate files — see [env.md](env.md).

## Troubleshooting

- **Missing `.env.local`:** `cp .env.local.example .env.local`
- **Marketing slow to start:** wait ~30s after `make up`, then `make smoke` again
- **n8n 401 on prod URL:** ensure `N8N_API_URL=http://localhost:5678` in `.env.local`
- **Compose errors:** run `make config-dev` to validate compose + env
