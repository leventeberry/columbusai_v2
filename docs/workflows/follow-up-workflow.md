# Demo follow-up workflow (Discovery Call)

Scheduled discovery-call follow-up for demo leads. Postgres (`sales.leads`) is the source of truth; n8n polls for due leads and sends email by `followup_count`.

**Client template options (2-day / 7-day / 14-day multi-touch):** [follow-up-templates.md](follow-up-templates.md)

See also: [demo-request-workflow.md](demo-request-workflow.md), [n8n-workflow-sync.md](../architecture/n8n-workflow-sync.md).

## Flow

```txt
POST /api/leads/demo
  → save SalesLead (status=new, followup_count=0, next_followup_at=now+wait1)
  → n8n demo-request workflow (AI + confirmation emails)

Every 15 minutes (n8n schedule):
  → SELECT due leads from sales.leads
  → followup_count=0 → Follow-up email #1 → increment count, schedule wait2
  → followup_count=1 → Final follow-up email → increment count, clear next_followup_at
```

If an admin changes lead status away from `new` (qualified, disqualified, converted_to_opportunity), the lead is excluded from the poll query automatically.

## Lead status model

| `SalesLeadStatus` | Follow-up sends? |
|-------------------|------------------|
| `new` | Yes (if due per `next_followup_at` and `followup_count < 2`) |
| `qualified` | No |
| `disqualified` | No |
| `converted_to_opportunity` | No |

## Follow-up columns (`sales.leads`)

| Column | Purpose |
|--------|---------|
| `followup_count` | Emails sent so far (0, 1, or 2) |
| `last_followup_at` | Timestamp of last follow-up email |
| `next_followup_at` | When the next email is due (`NULL` after final send) |

Set on demo create via [`packages/leads/src/followupSchedule.ts`](../../packages/leads/src/followupSchedule.ts).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `FOLLOWUP_WAIT_1_MINUTES` | api | Delay before first follow-up (default 1440 prod, 1 dev) |
| `FOLLOWUP_WAIT_2_MINUTES` | api + n8n | Delay between email #1 and #2 |
| `BOOKING_LINK` | n8n | Cal link in email templates |
| `N8N_DEMO_FOLLOWUP_WORKFLOW_ID` | Sync scripts | Workflow id from `pnpm n8n:list` |

Docker compose sets `FOLLOWUP_WAIT_*` on **api** (lead insert) and **n8n** (schedule between emails).

n8n 2.x blocks `$env` in expressions by default. Compose sets `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` and whitelists `BOOKING_LINK`, `FOLLOWUP_WAIT_1_MINUTES`, `FOLLOWUP_WAIT_2_MINUTES` via `N8N_EXPRESSIONS_ALLOWED_ENV_VARS`. The expression editor may still show "access denied" during preview; values resolve at execution time after restarting the n8n container.

## API changes

- [`packages/leads/src/processDemoLead.ts`](../../packages/leads/src/processDemoLead.ts) — saves lead with `next_followup_at`; no webhook follow-up trigger.
- Demo-request webhook (`sendLeadToN8n`) unchanged.

## Workflow file

[`infra/n8n/workflows/demo-follow-up.workflow.json`](../../infra/n8n/workflows/demo-follow-up.workflow.json) — name `ColumbusAI_Demo_Follow_Up`, schedule trigger every 15 minutes.

Requires **Postgres account** credential (`postgres:5432`, database `columbus`) and **SMTP account** in n8n.

## First-time setup

1. Run DB migration (`pnpm --filter @columbusai/db db:migrate` or compose `migrate` service).
2. `pnpm n8n:list` → copy follow-up workflow id → `N8N_DEMO_FOLLOWUP_WORKFLOW_ID` in `.env.local`.
3. `pnpm n8n:push:followup` and `pnpm n8n:activate:followup`.
4. Configure **SMTP account** and **Postgres account** credentials in n8n.
5. Restart `api` and `n8n` so env vars apply.

## Sync commands

| Command | Description |
|---------|-------------|
| `pnpm n8n:pull:followup` | Pull workflow → `demo-follow-up.workflow.json` |
| `pnpm n8n:push:followup` | Push JSON to n8n |
| `pnpm n8n:activate:followup` | Activate workflow |

## Verification checklist

1. Set `FOLLOWUP_WAIT_1_MINUTES=1`, `FOLLOWUP_WAIT_2_MINUTES=2` in `.env.local`; restart api + n8n.
2. Submit demo: `curl -X POST http://localhost:4000/api/leads/demo -H "Content-Type: application/json" -d '{"first_name":"Test","last_name":"FollowUp","email":"test@example.com","what_automate":"Lead routing"}'`
3. Confirm in DB: `followup_count=0`, `next_followup_at` set.
4. Wait for schedule (or `UPDATE sales.leads SET next_followup_at = NOW() - interval '1 minute' WHERE email = 'test@example.com'`).
5. n8n execution: email #1, then `followup_count=1`.
6. After wait2: email #2, `followup_count=2`, `next_followup_at=NULL`.
7. Move lead to `qualified` in admin → no further emails.
8. `pnpm typecheck` passes.

## Deferred

- Persisting demo AI analysis into `SalesLead.summary` / `analysisRaw`
- Linking `sales.leads` to `automation.clients` for richer stage-based sequences
- Opportunity auto-creation from follow-up replies
