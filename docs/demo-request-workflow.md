# Demo request workflow

## Flow

Marketing `ContactSection` → `POST {VITE_API_URL}/api/leads/demo` → `@columbusai/leads` `processDemoLead` → Postgres `leads` table (or `LEADS_PATH` jsonl) → n8n demo-request webhook (non-blocking). Follow-up emails are sent by the scheduled n8n workflow (see [demo-follow-up-workflow.md](demo-follow-up-workflow.md)).

Shared lead logic lives in [`packages/leads`](../packages/leads/) (ported from marketing server fn + n8n sender).

Discovery-call follow-up: [demo-follow-up-workflow.md](demo-follow-up-workflow.md).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_API_URL` | Marketing (public) | API base, e.g. `http://localhost:4000` |
| `DATABASE_URL` | API | Lead storage (required for API startup) |
| `N8N_DEMO_WEBHOOK_URL` | API only | Production demo webhook |
| `N8N_DEMO_WEBHOOK_TEST_URL` | API only | Dev demo webhook |
| `N8N_WEBHOOK_URL` / `N8N_WEBHOOK_TEST_URL` | API only | Fallback if demo vars unset |
| `BOOKING_LINK` | API + n8n | Cal link in demo/follow-up emails |
| `CORS_ORIGIN` | API | Must include marketing origin |

## API contract

`POST /api/leads/demo`

**Body (JSON):** `first_name`, `last_name`, `email` required; optional `phone`, `company`, `role`, `industry`, `team_size`, `website`, `what_automate`, `budget`, `timeline`, `message`. Legacy keys `fname` / `firstName` also accepted.

**200:** `{ "ok": true, "id": "<uuid>" }` — lead saved even if webhook fails.

**400:** `{ "ok": false, "errors": { "first_name": "..." } }`

**500:** `{ "ok": false, "errors": { "_form": "Failed to save lead..." } }`

## curl

```bash
curl -sS -X POST http://localhost:4000/api/leads/demo \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "company": "Acme",
    "what_automate": "Invoice processing"
  }'
```

## Local test plan

1. Start stack: `docker compose -f infra/docker/compose.dev.yml up -d postgres api marketing` (or `make up` + `make dev-marketing`)
2. Set `N8N_DEMO_WEBHOOK_TEST_URL` (or legacy `N8N_WEBHOOK_TEST_URL`) in `.env.local`
3. Open http://localhost:3000/contact and submit the demo form
4. Expect success UI, API logs `lead_created` + `lead_webhook_sent`
5. Break webhook URL or stop n8n — submit again; expect **200** + `lead_webhook_failed`, row still in DB

## DB verification

```sql
SELECT id, email, company, what_automate, created_at
FROM leads ORDER BY created_at DESC LIMIT 5;
```

## Workflow sync (dev)

Version and deploy the demo workflow from the repo: see [n8n-workflow-sync.md](n8n-workflow-sync.md) (`pnpm n8n:list`, `n8n:pull:demo`, `n8n:push:demo`, `n8n:activate:demo`).

**Env pitfalls:** `N8N_DEMO_WORKFLOW_ID` is the workflow id from `n8n:list` (not the webhook path UUID). Docker API uses `http://n8n:5678/webhook/...` via compose overrides. Active workflows need `/webhook/`; `/webhook-test/` only works while listening for test events in the n8n editor.

## n8n verification

- Check n8n Cloud execution history for the demo workflow
- Confirm internal notification and prospect confirmation email nodes run (workflow-side)

## Production verification

1. Deploy **api** + **marketing** with `CORS_ORIGIN=https://columbusai.tech,https://www.columbusai.tech`, `VITE_API_URL=https://api.columbusai.tech`, `N8N_DEMO_WEBHOOK_URL=<prod>`
2. Submit on https://columbusai.tech/contact
3. Check API logs, `leads` row, n8n execution

## Verify (logs)

1. API logs: `lead_created`, then `lead_webhook_sent` or `lead_webhook_failed` / `lead_webhook_skipped`
2. DB query above
3. n8n Cloud execution on demo workflow
