# Demo follow-up workflow (Discovery Call)

Automated discovery-call follow-up after a demo request. Postgres is the source of truth; n8n re-fetches lead status before each email.

See also: [demo-request-workflow.md](demo-request-workflow.md), [n8n-workflow-sync.md](n8n-workflow-sync.md).

## Flow

```txt
POST /api/leads/demo
  → save SalesLead (status=new)
  → n8n demo-request workflow (AI + confirmation emails)
  → n8n demo-follow-up workflow (trigger only)
       → Wait 1 (24h prod / 1 min dev)
       → GET /api/leads/:id
       → IF status === new → Follow-up email #1
       → Wait 2 (48h prod / 2 min dev)
       → GET /api/leads/:id
       → IF status === new → Final follow-up email
```

If an admin changes lead status away from `new` (qualified, disqualified, converted_to_opportunity), later branches skip emails automatically.

## Lead status model (actual)

| `SalesLeadStatus` | Follow-up sends? |
|-------------------|------------------|
| `new` | Yes (if still new at check time) |
| `qualified` | No |
| `disqualified` | No |
| `converted_to_opportunity` | No |

There is no `contacted` or `lost` lead status; `lost` is a pipeline stage mapped to `disqualified`.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `N8N_DEMO_FOLLOWUP_WEBHOOK_URL` | API | Prod follow-up webhook (`/webhook/demo-follow-up`) |
| `N8N_DEMO_FOLLOWUP_WEBHOOK_TEST_URL` | API (dev) | Dev follow-up webhook |
| `N8N_DEMO_FOLLOWUP_WORKFLOW_ID` | Sync scripts | Workflow id from `pnpm n8n:list` |
| `COLUMBUS_API_URL` | n8n container | Internal API base (`http://api:4000`) |
| `ADMIN_API_TOKEN` | n8n container | `X-Admin-Token` for `GET /api/leads/:id` |
| `FOLLOWUP_WAIT_1_MINUTES` | n8n container | First wait (default 1440 prod, 1 dev) |
| `FOLLOWUP_WAIT_2_MINUTES` | n8n container | Second wait (default 2880 prod, 2 dev) |
| `BOOKING_LINK` | API | Included in trigger payload |

Docker compose sets internal webhook URLs on the `api` service and wait/API token vars on `n8n`.

## API changes

- [`packages/leads/src/processDemoLead.ts`](../packages/leads/src/processDemoLead.ts) — after demo webhook, POST follow-up trigger (non-blocking).
- Logs: `demo_followup_trigger_sent`, `demo_followup_trigger_failed`, `demo_followup_trigger_skipped`.
- **No new HTTP routes** — reuses `GET /api/leads/:id` with existing admin auth.

## Security (n8n → API)

n8n calls `GET /api/leads/:id` with header:

```http
X-Admin-Token: <ADMIN_API_TOKEN>
```

Same token as admin sales API (`requireAdminAccess`). Not exposed publicly. Set `ADMIN_API_TOKEN` in `.env.local` / `.env.production` and pass it to the n8n container via compose.

## Workflow file

[`infra/n8n/workflows/demo-follow-up.workflow.json`](../infra/n8n/workflows/demo-follow-up.workflow.json) — name `ColumbusAI_Demo_Follow_Up`, webhook path `demo-follow-up`.

## First-time setup

1. Import or create workflow in n8n (or push JSON after setting id — see sync below).
2. `pnpm n8n:list` → copy follow-up workflow id → `N8N_DEMO_FOLLOWUP_WORKFLOW_ID` in `.env.local` or `.env.production`.
3. `pnpm n8n:push:followup` and `pnpm n8n:activate:followup`.
4. Ensure SMTP credential `SMTP account` exists in n8n (same as demo-request workflow).
5. Restart `api` and `n8n` so env vars apply.

## Sync commands

| Command | Description |
|---------|-------------|
| `pnpm n8n:pull:followup` | Pull workflow → `demo-follow-up.workflow.json` |
| `pnpm n8n:push:followup` | Push JSON to n8n |
| `pnpm n8n:activate:followup` | Activate workflow |

## Verification checklist

1. Set `FOLLOWUP_WAIT_1_MINUTES=1`, `FOLLOWUP_WAIT_2_MINUTES=2` in `.env.local`; restart n8n.
2. Submit demo: `curl -X POST http://localhost:4000/api/leads/demo -H "Content-Type: application/json" -d '{"first_name":"Test","last_name":"FollowUp","email":"test@example.com","what_automate":"Lead routing"}'`
3. API logs: `lead_created`, `demo_followup_trigger_sent`.
4. n8n: follow-up execution waiting, then GET lead, then email #1 if status `new`.
5. In admin, move lead to `qualified` via pipeline.
6. After wait 2, execution should skip final email.
7. `pnpm typecheck` passes.

## Deferred (Client Onboarding milestone)

- Persisting demo AI analysis into `SalesLead.summary` / `analysisRaw`
- Dedicated read-only internal API token
- Cancelling in-flight n8n waits from API events
- Opportunity auto-creation from follow-up replies
- Client onboarding automation
