# Client onboarding engine

Columbus AI converts won opportunities into operational portal tenants through a single orchestrated flow.

## Flow

```text
Opportunity (won)
  → POST /api/opportunities/:id/convert-to-client
  → sales.clients (CRM record)
  → portal.clients (workspace tenant)
  → auth.users + auth.client_users (portal membership)
  → portal.work_items (onboarding checklist)
  → portal.notifications (client + agency)
  → auth.audit_events (client.provisioned)
  → automation.clients follow-up stopped (by email)
  → optional ONBOARDING_WEBHOOK_URL (n8n / external)
```

## API

| Endpoint | Purpose |
|----------|---------|
| `POST /api/opportunities/:id/convert-to-client` | Convert + provision (body: optional `stackTemplateId`) |
| `POST /api/clients/:id/retry-provision` | Retry failed portal provisioning |
| `GET /api/onboarding/stack-templates` | List purchasable stack templates |
| `POST /api/onboarding/events` | Admin webhook receiver for external automations |
| `PATCH /api/portal/notifications/:id/read` | Mark notification read |
| `POST /api/portal/notifications/read-all` | Mark all notifications read |

## Stack templates

Recorded on `sales.clients.stack_template_id` at conversion:

- `tpl-basic` — website + analytics
- `tpl-automation` — website, postgres, redis, n8n, analytics
- `tpl-ai` — full AI stack including vector + ai-agent

Infrastructure deployment (Hostinger) is **not** automated yet — templates are recorded for ops handoff.

## Environment

| Variable | Purpose |
|----------|---------|
| `ONBOARDING_WEBHOOK_URL` | Optional POST target when a client is provisioned (n8n trigger) |

## Admin UX

- Opportunity detail: **Convert to client** (stack template picker)
- Kanban drag to **Won** auto-converts via `PATCH /api/opportunities/:id`
- Sales client detail: provisioning status, portal IDs, retry button
- `/clients/{uuid}` redirects to `/sales/clients/{uuid}`

## Phase 4 (deferred automation)

- Hostinger DNS / deploy via `scripts/hostinger/`
- n8n onboarding checklist workflow (subscribe to webhook or poll)
- `automation.Client` billing bridge (Stripe customer creation)
- Persisted workspace/environment tables (replace admin mock platform)

## Verification

```bash
pnpm typecheck
infra/scripts/test-sales-pipeline.sh   # requires API + ADMIN_API_TOKEN
make smoke
```

Manual: convert opportunity → log into portal as client email → see onboarding work item + welcome notification.

### Local dev credentials

| App | Email | Password |
|-----|-------|----------|
| Admin | `admin@columbusai.com` | `SEED_ADMIN_PASSWORD` in `.env.local` |
| Portal (demo client) | `kira@kdmdermatherapy.com` | `SEED_ADMIN_PASSWORD` in `.env.local` |

Agency staff (`levente@`, `devon@`, `maya@columbusai.com`) use the same seed password. Re-run `pnpm --filter @columbusai/db db:seed` after changing `SEED_ADMIN_EMAIL` or `SEED_ADMIN_PASSWORD`.
