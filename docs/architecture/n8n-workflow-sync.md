# n8n workflow sync (dev tooling)

Repo scripts to list, pull, push, and activate n8n workflows via the [Public API v1](https://docs.n8n.io/api/api-reference/). Not used by app runtime.

**Local testing (recommended):** [n8n-local-dev.md](n8n-local-dev.md) — use `.env.local` + `pnpm n8n:bootstrap-local` against Docker n8n on port 5678.

## Setup (local)

1. `make n8n-local-up`
2. `cp .env.local.example .env.local`
3. Create API key at http://localhost:5678 → **Settings → n8n API**
4. `pnpm n8n:doctor` then `pnpm n8n:bootstrap-local`

```env
# .env.local (pnpm n8n:* loads this file by default)
N8N_API_URL=http://localhost:5678
N8N_API_KEY=<your-local-key>
```

Never commit API keys. Scripts do not print them.

**Workflow id vs webhook path:** `N8N_DEMO_WORKFLOW_ID` is the workflow id from `pnpm n8n:list` (e.g. `gEEYTVQe39iBRra3`). The demo-request webhook URL uses a different UUID (the Webhook node path). The follow-up workflow uses a schedule trigger (no webhook). Scripts exit with a clear error if you set the demo workflow id to the webhook path UUID.

## Commands

| Script | pnpm command | Description |
|--------|--------------|-------------|
| List | `pnpm n8n:list` | All workflows (`id`, `name`, `active`, `updatedAt`) |
| Pull demo | `pnpm n8n:pull:demo` | → `demo-request.workflow.json` |
| Push demo | `pnpm n8n:push:demo` | Update demo-request workflow |
| Activate demo | `pnpm n8n:activate:demo` | Activate demo-request |
| Pull follow-up | `pnpm n8n:pull:followup` | → `demo-follow-up.workflow.json` |
| Push follow-up | `pnpm n8n:push:followup` | Update follow-up workflow |
| Activate follow-up | `pnpm n8n:activate:followup` | Activate follow-up |
| Generate follow-up templates | `pnpm n8n:generate:followup-templates` | Emit 2day/7day/14day template JSON (see [follow-up-templates.md](../workflows/follow-up-templates.md)) |
| Push follow-up templates | `pnpm n8n:push:followup-templates` | Create/update template workflows in n8n (inactive) |

## Typical flow (demo-request)

1. `pnpm n8n:list` — copy the demo workflow `id` into `N8N_DEMO_WORKFLOW_ID`
2. `pnpm n8n:pull:demo` — version workflow JSON in git
3. Edit `infra/n8n/workflows/demo-request.workflow.json`
4. `pnpm n8n:push:demo` — apply changes
5. `pnpm n8n:activate:demo` — enable triggers

## Typical flow (demo-follow-up)

1. `pnpm n8n:list` — copy follow-up workflow `id` into `N8N_DEMO_FOLLOWUP_WORKFLOW_ID`
2. Edit `infra/n8n/workflows/demo-follow-up.workflow.json` (or pull from n8n after UI setup)
3. `pnpm n8n:push:followup` → `pnpm n8n:activate:followup`

See [follow-up-workflow.md](../workflows/follow-up-workflow.md).

## Notes

- **PATCH / PUT:** Scripts try `PATCH` first; local Docker n8n often requires `PUT` (405 → automatic fallback).
- **Credentials:** Node `credentials` refs in JSON are sent as-is; nothing is invented or merged from the server.
- **Read-only fields** (`createdAt`, `updatedAt`, `meta`, `tags`, etc.) are stripped on pull/push.
- **Activation** is a separate step; `active` is not set via push.

## Cloud

Point `N8N_API_URL` at your n8n Cloud instance URL and use a Cloud API key. Same commands apply.
