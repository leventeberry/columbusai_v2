# Columbus AI (monorepo)

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

**Two databases (Phase 3+):** The app uses two Postgres databases when RAG is enabled: **chat** (Prisma, conversations/messages) and **RAG** (pgvector, documents/chunks; no Prisma). Compose defines two services: `postgres` (chat, host port 5432) and `postgres-vectors` (RAG, host port 5433). Web depends on both when using RAG. **Migrations** (`db:migrate` / `db-migrate.sh`) apply only to the **chat DB** (DATABASE_URL). The vector DB has no Prisma migrations; its schema is created by the app on first ingest or first retrieval (`ensureVectorSchema` in `apps/web/lib/vector-db.ts`).

**Prereq:** Postgres (run locally or via Docker Compose).

### Phase 1: Run locally

1. Copy `apps/web/.env.example` to `apps/web/.env` and set `DATABASE_URL` for local Postgres, e.g.:
   ```bash
   DATABASE_URL="postgresql://columbus:columbus@localhost:5432/columbus"
   ```
   For RAG (Phase 3): set `VECTOR_DATABASE_URL="postgresql://columbus:columbus@localhost:5433/columbus_vectors"` and start both Postgres services: `docker compose -f infra/docker/compose.dev.yml up -d postgres postgres-vectors`.
2. Ensure Postgres is running (e.g. start only chat: `docker compose -f infra/docker/compose.dev.yml up -d postgres`, or both: `postgres postgres-vectors`).
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
2. Run migrations (chat DB only; web container has `DATABASE_URL` → `postgres`, `VECTOR_DATABASE_URL` → `postgres-vectors`):
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

## Phase 5: Prod compose runbook

Phase 5 runs the stack in a production-like way: built images only (no bind mounts), explicit migrations, healthchecks, and the same network topology as dev.

**Prereq:** Docker and Docker Compose v2.1+ (for `service_completed_successfully`). Create `apps/web/.env` from `apps/web/.env.example` and set at least `OPENAI_API_KEY` (and optionally other vars). Compose injects `DATABASE_URL`, `VECTOR_DATABASE_URL`, and `REDIS_URL` from the compose file; you can override via `env_file` or environment.

### Start prod stack

From the repo root:

```bash
docker compose -f infra/docker/compose.prod.yml up --build -d
```

### Verify

```bash
# Health
curl http://localhost:3000/api/health
# Expect: {"ok":true}

# Chat (requires OPENAI_API_KEY in .env or environment)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hi"}'

# All services healthy or completed (migrate, init-vectors are one-shot)
docker compose -f infra/docker/compose.prod.yml ps
```

### Fresh machine / from scratch

To remove all data and re-run from a clean state:

```bash
docker compose -f infra/docker/compose.prod.yml down -v
docker compose -f infra/docker/compose.prod.yml up --build
```

The `-v` flag removes named volumes (Postgres and Redis data). The next `up --build` recreates DBs and runs migrations again.

### Required env vars in prod

- **Required for /api/chat:** `DATABASE_URL`, `OPENAI_API_KEY` (compose sets `DATABASE_URL`; ensure `OPENAI_API_KEY` is in `apps/web/.env` or passed to the web service).
- **Optional:** `VECTOR_DATABASE_URL` (RAG; compose sets it), `REDIS_URL` (compose sets it), `OPENAI_MODEL`, `OPENAI_EMBED_MODEL`, `OPENAI_STORE`, `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_SCOPE`, `RETRIEVAL_K`, `ADMIN_TOKEN` (for future ingestion API).

See `apps/web/.env.example` for all supported variables.

### Two-step startup (older Compose)

If your Compose version does not support `depends_on: condition: service_completed_successfully`, run migrations manually then start web:

```bash
docker compose -f infra/docker/compose.prod.yml up -d postgres postgres-vectors redis
docker compose -f infra/docker/compose.prod.yml run --rm migrate
docker compose -f infra/docker/compose.prod.yml up -d web
```
