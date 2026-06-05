# Local n8n workflow development

Use Docker n8n on **localhost** to test and update workflows, then push the same JSON to production when ready. This mirrors production (Postgres-backed n8n, internal webhooks, same workflow files) without calling `n8n.columbusai.tech` from your laptop.

## Environment files

| File | Purpose |
|------|---------|
| `.env.local` | Local Docker dev + `pnpm n8n:*` (default) |
| `.env.production` | Production VPS + `COLUMBUS_ENV=production pnpm n8n:*` |
| `.env.staging` | Staging stack (`make up-staging`) |

See [environment.md](environment.md). `pnpm n8n:*` loads `.env.local` unless `COLUMBUS_ENV=production`.

## Quick start

```bash
# 1. Start local n8n + API (same compose as daily dev)
make n8n-local-up

# 2. Local sync profile
cp .env.local.example .env.local
# Edit .env.local: set N8N_API_KEY from http://localhost:5678 → Settings → n8n API

# 3. Verify API access
pnpm n8n:doctor

# 4. Push + activate demo-request and demo-follow-up from repo JSON
pnpm n8n:bootstrap-local
# Copy printed workflow ids into .env.local

# 5. Edit workflows
#    - Edit infra/n8n/workflows/*.workflow.json
#    - pnpm n8n:push:demo / pnpm n8n:push:followup
#    - pnpm n8n:activate:demo / pnpm n8n:activate:followup

# 6. Test end-to-end
curl -X POST http://localhost:4000/api/leads/demo \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"Local","email":"you@example.com","what_automate":"Test automation"}'
```

Watch executions at http://localhost:5678.

## What mirrors production?

| Piece | Local | Production |
|-------|-------|------------|
| Workflow JSON | Same files in `infra/n8n/workflows/` | `pnpm n8n:push:*` to cloud |
| Webhooks | `http://n8n:5678/webhook/...` (compose → api) | `https://n8n.columbusai.tech/webhook/...` |
| Follow-up waits | `FOLLOWUP_WAIT_1_MINUTES=1` | `1440` / `2880` |
| Lead API | `GET http://api:4000/api/leads/:id` + `ADMIN_API_TOKEN` | Same pattern |

## Commands

| Command | Description |
|---------|-------------|
| `make n8n-local-up` | Start postgres, n8n, api |
| `pnpm n8n:doctor` | Test `N8N_API_URL` + `N8N_API_KEY` |
| `pnpm n8n:bootstrap-local` | Create/update + activate both workflows on **local** n8n only |
| `pnpm n8n:list` | List workflows on target in `N8N_API_URL` |
| `pnpm n8n:push:demo` / `push:followup` | Push JSON after edits |

## Production sync (separate)

Use `.env.production` for VPS deploy (`make up-prod`). For `pnpm n8n:*` against production n8n:

```bash
COLUMBUS_ENV=production pnpm n8n:push:demo
COLUMBUS_ENV=production pnpm n8n:activate:demo
```

Set `N8N_API_URL` and `N8N_API_KEY` in `.env.production`.

If prod returns **401 unauthorized**, create a new API key in the production n8n UI. Restarting the local Docker container does not fix prod API auth.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing N8N_API_KEY` | Create key in local n8n UI; set in `.env.local` |
| `401 unauthorized` on prod URL | Use `.env.local` with `N8N_API_URL=http://localhost:5678` |
| `Refusing bootstrap` | `bootstrap-local` only runs against localhost |
| Webhook 404 | Run `pnpm n8n:activate:demo` / `activate:followup` |
| SMTP errors in n8n | Configure **SMTP account** credential in local n8n (copy from prod or use test SMTP) |

See also [n8n-workflow-sync.md](n8n-workflow-sync.md), [demo-request-workflow.md](../workflows/demo-request-workflow.md), [follow-up-workflow.md](../workflows/follow-up-workflow.md).
