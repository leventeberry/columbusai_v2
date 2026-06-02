# Columbus AI (monorepo)

## Apps

| App | Path | Dev URL | Role |
|-----|------|---------|------|
| **Marketing** | `apps/marketing` | http://localhost:3000 | Public site, chat widget, contact/demo |
| **Portal** | `apps/portal` | http://localhost:3001 | Client portal |
| **Admin** | `apps/admin` | http://localhost:3002 | Admin dashboard |
| **API** | `apps/api` | http://localhost:4000 | Chat, messages, OpenAI |
| **Web (legacy)** | `apps/web` | http://localhost:3010 (Docker profile `legacy`) | Previous Next.js marketing site |
| **n8n** | docker service `n8n` | http://localhost:5678 | Automation workflow builder |

Copy [`.env.local.example`](.env.local.example) to [`.env.local`](.env.local) at repo root (see [docs/env.md](docs/env.md)). `make up-dev` uses `.env.local` with `compose.dev.yml`.

```bash
# From repo root (Node 26+, pnpm via Corepack)
corepack enable && corepack prepare pnpm@10.12.4 --activate
pnpm install
make up-dev          # marketing + portal + admin + api + postgres + redis
make dev-marketing   # host-only marketing
```

**Marketing** uses TanStack Start (Vite). Chat calls `VITE_API_URL` (default `http://localhost:4000`). Demo requests POST to `POST /api/leads/demo` on the API (`@columbusai/leads` shared package). See [docs/demo-request-workflow.md](docs/demo-request-workflow.md).

## Hermes agent runner (repo-local)

Hermes is a local Cursor SDK runner in `tools/hermes/`.

```bash
# one-time
pnpm install

# create a fresh session
pnpm run hermes -- --new "audit compose.dev and propose fixes"

# resume previous session
pnpm run hermes -- --resume "apply the approved fix and commit"

# allow push actions for this run
pnpm run hermes -- --approve-push "commit and push this branch"
```

State and structured logs are written to:
- `tools/hermes/state/agent-state.json`
- `tools/hermes/state/runs.ndjson`

Optional hooks:
- Slack: `HERMES_SLACK_WEBHOOK_URL`
- GitHub issue comment: `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `HERMES_GITHUB_ISSUE_NUMBER`

---

Phase 0: bootable skeleton — web app with UI layout shell, health endpoint, and Docker dev compose.

## Phase 0: Run locally

From the repo root:

```bash
cd apps/web
npm install
npm run dev
```

- App: http://localhost:3000  
- Health: `curl http://localhost:3000/api/health` → `{"ok":true}`

## Phase 0: Run with Docker Compose

From the repo root:

```bash
docker compose -f infra/docker/compose.dev.yml up --build
```

Or use the helper scripts (work from any directory):

```bash
./infra/scripts/dev-up.sh
# when done:
./infra/scripts/dev-down.sh
```

- App: http://localhost:3000  
- Health: `curl http://localhost:3000/api/health` → `{"ok":true}`

## Verification (Phase 0)

1. **Local dev:** After `npm run dev` in `apps/web`, open http://localhost:3000 and run `curl http://localhost:3000/api/health`; expect `{"ok":true}`.
2. **Docker Compose:** After `docker compose -f infra/docker/compose.dev.yml up --build`, open http://localhost:3000 and run `curl http://localhost:3000/api/health`; expect `{"ok":true}`.
3. **UI:** Page shows header (logo + “Request a Demo”), hero section with background image and CTAs, and footer with product/contact/legal links.

## Env (optional)

Copy `.env.example` to `.env` and set `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_CONTACT_PHONE` if you want contact details in the footer. None are required for Phase 0.

---

## Phase 1: Database contract (Prisma + messages API + proof UI)

Phase 1 adds Postgres, Prisma (chat schema), message persistence endpoints, and a minimal `/dev/messages` UI. No OpenAI yet; schema is Responses API–ready.

**One Postgres, three databases:** A single `pgvector/pg16` container (`postgres`, host port 5432) hosts **columbus** (platform / Prisma / leads), **columbus_vectors** (RAG / pgvector), and **n8n** (local n8n metadata). **Migrations** (`db:migrate` / `db-migrate.sh`) apply only to **columbus** (`DATABASE_URL`). The vector DB has no Prisma migrations; its schema is created by the app on first ingest or retrieval (`ensureVectorSchema` in `apps/web/lib/vector-db.ts`). See [docs/postgres.md](docs/postgres.md) for one-time setup on existing volumes.

**Prereq:** Postgres (run locally or via Docker Compose).

**Development flows (DATABASE_URL):** You do not need to set `DATABASE_URL` manually in either flow. (1) **Host:** Run `npm run dev` in `apps/web` with Postgres on the host (e.g. `docker compose -f infra/docker/compose.dev.yml up -d postgres`). If `DATABASE_URL` is unset, it defaults to `postgresql://columbus:columbus@localhost:5432/columbus`. (2) **Docker:** Run `docker compose -f infra/docker/compose.dev.yml up`; Compose injects `DATABASE_URL`, `VECTOR_DATABASE_URL`, and `REDIS_URL`.

### Phase 1: Run locally

1. Copy `apps/web/.env.example` to `apps/web/.env`. In development, `DATABASE_URL` is optional (it defaults to localhost:5432 when unset). To override, set e.g. `DATABASE_URL="postgresql://columbus:columbus@localhost:5432/columbus"`.
   For RAG (Phase 3): set `VECTOR_DATABASE_URL="postgresql://columbus:columbus@localhost:5432/columbus_vectors"` and start Postgres: `docker compose -f infra/docker/compose.dev.yml up -d postgres`.
2. Ensure Postgres is running: `docker compose -f infra/docker/compose.dev.yml up -d postgres` (the `ensure-databases` job creates `columbus_vectors` and `n8n` if missing).
3. Run migrations (chat DB only):
   ```bash
   cd apps/web && npm run db:migrate
   ```
   Or from repo root with `.env` loaded: `./infra/scripts/db-migrate.sh`
4. Start the app: `cd apps/web && npm run dev`.
5. App: http://localhost:3000 — Health: http://localhost:3000/api/health — Messages UI: http://localhost:3000/dev/messages

### Phase 1: Run with Docker Compose

1. From repo root:
   ```bash
   docker compose -f infra/docker/compose.dev.yml up -d --build
   ```
   The web service is built with the Dockerfile `dev` stage and runs `next dev`; Compose injects `DATABASE_URL`, `VECTOR_DATABASE_URL`, and `REDIS_URL`.
2. Run migrations (platform DB only; web container has `DATABASE_URL` → `postgres`, `VECTOR_DATABASE_URL` → `postgres:5432/columbus_vectors`):
   ```bash
   docker compose -f infra/docker/compose.dev.yml exec web npm run db:migrate
   ```
   (Prisma schema includes `binaryTargets` for Alpine so the client works in Docker.)
3. App: http://localhost:3000 — Messages UI: http://localhost:3000/dev/messages

### Phase 1: Validation commands (Definition of Done)

Run these to verify Phase 1:

```bash
# 1. Start stack
docker compose -f infra/docker/compose.dev.yml up -d --build

# 2. Run migrations
docker compose -f infra/docker/compose.dev.yml exec web npm run db:migrate

# 3. Health
curl http://localhost:3000/api/health
# Expect: {"ok":true}

# 4. Create a message (no conversationId = new conversation)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"hello"}'
# Expect: {"conversationId":"<uuid>","message":{...}}

# 5. Fetch messages (replace <id> with conversationId from step 4)
curl "http://localhost:3000/api/messages?conversationId=<id>"
# Expect: {"messages":[...]}

# 6. Open http://localhost:3000/dev/messages — send a message, refresh; messages persist.
```

---

## Phase 4: Rate limiting (Redis)

Phase 4 adds Redis-backed rate limiting to `POST /api/chat` to prevent abuse and control costs. When `REDIS_URL` is unset, rate limiting is disabled (all requests allowed) so Phase 2/3 behaviour is unchanged.

**Prereq:** Redis (included in Docker Compose; for local dev without Docker, run Redis on port 6379 or leave `REDIS_URL` unset to disable).

### Phase 4: Env

- `REDIS_URL` — e.g. `redis://redis:6379` (compose), `redis://localhost:6379` (local). When unset, no rate limiting.
- `RATE_LIMIT_WINDOW_SECONDS` — window length in seconds (default 300 = 5 min).
- `RATE_LIMIT_MAX_REQUESTS` — max requests per window per key (default 20).
- `RATE_LIMIT_SCOPE` — `ip` (default) or `ip+conversation` to scope by conversation in addition to IP.

Docker Compose sets `REDIS_URL` for the web service; override in `apps/web/.env` if needed.

### Phase 4: Verification

1. Start the stack (includes Redis):
   ```bash
   docker compose -f infra/docker/compose.dev.yml up -d --build
   ```
2. Run migrations if not done: `docker compose -f infra/docker/compose.dev.yml exec web npm run db:migrate`
3. Health: `curl http://localhost:3000/api/health` → `{"ok":true}`
4. Send many rapid `POST /api/chat` requests (same IP) until you get HTTP 429:
   ```bash
   for i in $(seq 25); do
     curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat \
       -H "Content-Type: application/json" -H "x-forwarded-for: 1.2.3.4" \
       -d '{"message":"hi"}';
   done
   ```
   Expect a mix of 200 then 429. Response body when limited: `{"error":"Rate limit exceeded. Please try again shortly."}` with headers `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`.
5. Wait for the window to reset (default 300 seconds), or set a short window (e.g. `RATE_LIMIT_WINDOW_SECONDS=10`) and retry; the next request should succeed (200).
6. Optional: use a different `x-forwarded-for` value (e.g. `5.6.7.8`) and confirm those requests have a separate limit (different key, no collision).

---

## Phase 5: Production deployment

Production runs on a single VPS (e.g. Hostinger) with Traefik TLS and [infra/docker/compose.prod.yml](infra/docker/compose.prod.yml).

**Routing (v2):**

| Host | App |
|------|-----|
| `columbusai.tech` | marketing |
| `api.columbusai.tech` | api |
| `admin.columbusai.tech` | admin |
| `portal.columbusai.tech` | portal |
| `n8n.columbusai.tech` | n8n |

Legacy Next.js (optional): `docker compose --profile legacy up -d web` → `app.columbusai.tech`.

**Prereq:** Docker Compose v2.1+, `.env.production` from [`.env.production.example`](.env.production.example) (`DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `OPENAI_API_KEY`, `CORS_ORIGIN`, `VITE_API_URL`). See [docs/env.md](docs/env.md).

### Start prod stack

```bash
make up-prod
# or: docker compose -f infra/docker/compose.prod.yml up -d --build
```

### Verify

```bash
make verify-prod
curl -sf https://api.columbusai.tech/api/health
```

Full runbook: [docs/deployment-runbook.md](docs/deployment-runbook.md).

### Required env vars in prod

- **DOMAIN**, **ACME_EMAIL**, **POSTGRES_PASSWORD**
- **OPENAI_API_KEY**, **CORS_ORIGIN** (`https://columbusai.tech,https://www.columbusai.tech`)
- **VITE_API_URL** (`https://api.columbusai.tech`) — baked into marketing image at build
- **SESSION_SECRET**, **ADMIN_API_TOKEN** (optional legacy), auth seed vars — see `.env.production.example`

Compose injects `DATABASE_URL`, `REDIS_URL`, `VECTOR_DATABASE_URL`, and internal `N8N_DEMO_WEBHOOK_URL` for the API.
