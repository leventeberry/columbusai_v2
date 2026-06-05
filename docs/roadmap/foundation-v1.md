# Foundation v1

First foundation release: portal work center, three-environment env model, n8n workflow follow-up, and standardized local dev commands.

## Highlights

- **Portal work center** — requests, admin work views, notifications, global search
- **Three env files** — `.env.local`, `.env.staging`, `.env.production` with matching Compose stacks
- **n8n** — demo request workflow, follow-up workflow trigger, `pnpm n8n:doctor` / bootstrap-local
- **Local dev** — `make up` (canonical), `make smoke`, `make verify`, `docs/architecture/local-development.md`

## Verification (passed)

- `pnpm install`, `env:check`, `typecheck`, `lint`, `test`
- `make restart` / `make smoke` — API health + Postgres, Redis PONG, marketing/portal/admin/n8n HTTP
- `pnpm n8n:doctor` — local n8n API connection OK

## Quick start

```bash
cp .env.local.example .env.local   # add secrets
pnpm install
make up
make smoke
```

See [local-development.md](../architecture/local-development.md).
