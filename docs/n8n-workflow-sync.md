# n8n workflow sync (dev tooling)

Repo scripts to list, pull, push, and activate n8n workflows via the [Public API v1](https://docs.n8n.io/api/api-reference/). Not used by app runtime.

## Setup

1. Start local n8n: `docker compose -f infra/docker/compose.dev.yml up -d n8n`
2. In n8n UI (http://localhost:5678): **Settings → API** → create an API key
3. Copy [`.env.example`](../.env.example) vars into `.env`:

```env
N8N_API_URL=http://localhost:5678
N8N_API_KEY=<your-key>
N8N_DEMO_WORKFLOW_ID=<workflow-id>
```

Never commit the API key. Scripts do not print it.

**Workflow id vs webhook path:** `N8N_DEMO_WORKFLOW_ID` is the workflow id from `npm run n8n:list` (e.g. `gEEYTVQe39iBRra3`). The webhook URL uses a different UUID (the Webhook node path). Scripts exit with a clear error if you confuse the two.

## Commands

| Script | npm command | Description |
|--------|-------------|-------------|
| List | `npm run n8n:list` | All workflows (`id`, `name`, `active`, `updatedAt`) |
| Pull | `npm run n8n:pull:demo` | GET workflow → `infra/n8n/workflows/demo-request.workflow.json` |
| Push | `npm run n8n:push:demo` | Update workflow from JSON (PATCH, PUT fallback on local) |
| Activate | `npm run n8n:activate:demo` | POST `.../workflows/:id/activate` |

## Typical flow

1. `npm run n8n:list` — copy the demo workflow `id` into `N8N_DEMO_WORKFLOW_ID`
2. `npm run n8n:pull:demo` — version workflow JSON in git
3. Edit `infra/n8n/workflows/demo-request.workflow.json`
4. `npm run n8n:push:demo` — apply changes
5. `npm run n8n:activate:demo` — enable triggers

## Notes

- **PATCH / PUT:** Scripts try `PATCH` first; local Docker n8n often requires `PUT` (405 → automatic fallback).
- **Credentials:** Node `credentials` refs in JSON are sent as-is; nothing is invented or merged from the server.
- **Read-only fields** (`createdAt`, `updatedAt`, `meta`, `tags`, etc.) are stripped on pull/push.
- **Activation** is a separate step; `active` is not set via push.

## Cloud

Point `N8N_API_URL` at your n8n Cloud instance URL and use a Cloud API key. Same commands apply.
