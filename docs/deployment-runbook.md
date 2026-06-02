# Columbus AI — Production Deployment Runbook

Single VPS (Hostinger) deployment using Docker Compose and Traefik TLS.

**Canonical compose file:** [infra/docker/compose.prod.yml](../infra/docker/compose.prod.yml)

**From repo root:**

```bash
make up-prod
# or
docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d --build
```

## Target routing

| Host | Service |
|------|---------|
| `columbusai.tech` | marketing |
| `www.columbusai.tech` | redirect → apex |
| `api.columbusai.tech` | api |
| `admin.columbusai.tech` | admin |
| `portal.columbusai.tech` | portal |
| `n8n.columbusai.tech` | n8n |
| `app.columbusai.tech` | legacy Next.js (`--profile legacy`) |

## DNS (Hostinger)

Create A records pointing to the VPS public IP (`147.93.113.58`):

- `columbusai.tech` (`@`)
- `www`, `api`, `admin`, `portal`, `n8n`
- `app` (optional, legacy cutover)

Or run `npm run hostinger:provision:dns` if the zone is managed in Hostinger (see [hostinger-api.md](hostinger-api.md)).

## Hostinger API (optional automation)

From your laptop with production values in repo-root `.env.production` (including `HOSTINGER_API_TOKEN`):

1. Push the default branch to GitHub (public repo required for Docker Manager URL deploy).
2. Provision firewall, SSH key, and DNS:

   ```bash
   npm run hostinger:provision
   ```

3. Deploy the stack via Hostinger Docker Manager (pulls root `docker-compose.yml` from GitHub):

   ```bash
   npm run hostinger:deploy
   ```

4. Check project status / logs:

   ```bash
   npm run hostinger:deploy -- --status
   npm run hostinger:deploy -- --logs
   ```

5. Push and activate the demo n8n workflow (point `N8N_API_URL` at `https://n8n.columbusai.tech`):

   ```bash
   npm run n8n:push:demo
   npm run n8n:activate:demo
   ```

6. If Prisma migrate did not run automatically, SSH to the VPS and run:

   ```bash
   docker compose run --rm migrate
   ```

Full API mapping and constraints: [hostinger-api.md](hostinger-api.md).

## First VPS deployment (SSH + `remote-deploy.sh`)

When Hostinger Docker Manager is unavailable (Ubuntu VPS template), deploy from your laptop:

```bash
npm run hostinger:check-auth
npm run hostinger:provision:firewall
npm run hostinger:provision:ssh
ssh columbusai-vps 'echo ok'   # must succeed before deploy
./infra/scripts/remote-deploy.sh
```

The script runs an SSH preflight (fails in ~25s if port 22 is unreachable), bootstraps Docker, rsyncs the repo, copies `.env.production`, and runs `docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d --build`.

If SSH times out, open **hPanel → VPS → Browser terminal** and run:

```bash
systemctl enable --now ssh
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
```

See [vps-ssh-setup.md](vps-ssh-setup.md).

## First VPS deployment (manual SSH)

1. Install Docker Engine and Compose v2 on the VPS.
2. Clone the repository and `cd` into it.
3. Copy [.env.production.example](../.env.production.example) to `.env.production` and set values (see [env.md](env.md)). **Never commit live env files.**
4. Open firewall: **22** (SSH), **80**, **443**.
5. Push demo workflow to n8n (`COLUMBUS_ENV=production`, keys in `.env.production`):
   ```bash
   npm run n8n:push:demo
   npm run n8n:activate:demo
   ```
6. Start the stack:
   ```bash
   docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d --build
   ```
7. Verify:
   ```bash
   curl -sf https://api.columbusai.tech/api/health
   curl -sI https://www.columbusai.tech/ | head -5   # expect redirect to apex
   curl -sf https://columbusai.tech/ -o /dev/null
   ```
8. Demo pipeline: submit on `https://columbusai.tech/contact`, then check API logs and n8n execution:
   ```bash
   docker compose --env-file .env.production -f infra/docker/compose.prod.yml logs api --since 10m | grep lead_
   ```

## Updating production

```bash
git pull
docker compose --env-file .env.production -f infra/docker/compose.prod.yml build
docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d
```

If Prisma schema changed:

```bash
docker compose --env-file .env.production -f infra/docker/compose.prod.yml run --rm migrate
```

Rebuild a single service:

```bash
docker compose --env-file .env.production -f infra/docker/compose.prod.yml build marketing
docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d marketing
```

## Rollback

1. Check out the previous release: `git checkout <tag-or-commit>`
2. Rebuild and restart: `docker compose --env-file .env.production -f infra/docker/compose.prod.yml up -d --build`
3. If a migration broke the app, restore Postgres from backup (see below) before restarting.
4. Re-import n8n workflow from [infra/n8n/workflows/demo-request.workflow.json](../infra/n8n/workflows/demo-request.workflow.json) if the workflow changed.

## Backup

### Postgres (daily recommended)

Automated helper (gzip + retention):

```bash
./infra/scripts/backup-postgres.sh
```

Per-database dumps (manual):

```bash
docker compose --env-file .env.production -f infra/docker/compose.prod.yml exec -T postgres \
  pg_dump -U columbus -Fc columbus > backup-columbus-$(date +%F).dump
docker compose --env-file .env.production -f infra/docker/compose.prod.yml exec -T postgres \
  pg_dump -U columbus -Fc columbus_vectors > backup-vectors-$(date +%F).dump
docker compose --env-file .env.production -f infra/docker/compose.prod.yml exec -T postgres \
  pg_dump -U columbus -Fc n8n > backup-n8n-$(date +%F).dump
```

Copy dumps off the VPS (object storage, rsync, etc.).

### Restore (staging first)

```bash
docker compose --env-file .env.production -f infra/docker/compose.prod.yml exec -T postgres \
  pg_restore -U columbus -d columbus --clean < backup-columbus-YYYY-MM-DD.dump
```

### n8n workflows

```bash
npm run n8n:pull:demo   # from repo with N8N_API_KEY set
```

### Docker volumes

Optional Hostinger volume snapshots for `columbus_prod_pgdata`, `n8n_prod_data`, `columbus_prod_traefik_acme`.

## Production environment matrix

Set in VPS `.env.production` only. Do not commit secrets.

### Infra

| Variable | Required | Example |
|----------|----------|---------|
| `DOMAIN` | Yes | `columbusai.tech` |
| `ACME_EMAIL` | Yes | `admin@columbusai.tech` |
| `POSTGRES_PASSWORD` | Yes | strong password |

### API

| Variable | Required | Example |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | (secret) |
| `CORS_ORIGIN` | Yes | `https://columbusai.tech,https://www.columbusai.tech` |
| `BOOKING_LINK` | Recommended | public Cal.com URL |

Compose sets `DATABASE_URL`, `REDIS_URL`, `VECTOR_DATABASE_URL`, `N8N_DEMO_WEBHOOK_URL` (internal `http://n8n:5678/webhook/...`).

### Marketing (build-time)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `https://api.columbusai.tech` |
| `VITE_CONTACT_EMAIL` | Optional | `contact@columbusai.tech` |
| `BOOKING_LINK` / `VITE_BOOKING_LINK` | Optional | Cal.com URL |

### Admin

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | Yes | public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | public |
| `SUPABASE_URL` | Yes | server |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | server auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **secret** |

### n8n

| Variable | Required | Notes |
|----------|----------|-------|
| `N8N_BASIC_AUTH_USER` | Recommended | |
| `N8N_BASIC_AUTH_PASSWORD` | Recommended | strong password |

Compose sets `N8N_HOST`, `WEBHOOK_URL`, and Postgres `DB_POSTGRESDB_*` for self-hosted n8n.

### Dev-only (host / laptop)

`N8N_API_KEY`, `N8N_DEMO_WORKFLOW_ID` — for `npm run n8n:*` against the VPS (or tunneled n8n).

## Legacy app during cutover

```bash
docker compose --env-file .env.production -f infra/docker/compose.prod.yml --profile legacy up -d web
```

Serves `app.columbusai.tech` until marketing is confirmed as primary.

## Local pre-deploy verification

```bash
make verify-prod
```

See [infra/scripts/verify-prod-deploy.sh](../infra/scripts/verify-prod-deploy.sh).

`GET /api/health` returns `{ ok, database }` where `database` is `up` when Postgres answers a probe query.

## Readiness summary

| Component | Status | Notes |
|-----------|--------|-------|
| Marketing | READY | Prod Dockerfile + Traefik apex/www |
| API | READY | Prod image + demo webhook via internal n8n |
| Admin | PARTIAL | Postgres session auth; sales live; provisioning/analytics mock |
| Portal | PARTIAL | Postgres session auth; Work Center on live API (`DEV_MOCK_PORTAL` for UI-only dev) |
| n8n | READY | In prod compose; push workflow before go-live |
| Postgres | READY | `columbus`, `columbus_vectors`, `n8n` |
| Redis | READY | |
| Traefik | READY | Labels in compose.prod.yml |
| Legacy web | READY | Optional `--profile legacy` |

See also [postgres.md](postgres.md) and [demo-request-workflow.md](demo-request-workflow.md).
