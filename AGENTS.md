## Cursor Cloud specific instructions

Columbus AI is an npm workspaces monorepo (`apps/web`, `apps/api`, `packages/db`). Standard commands live in the root `README.md` and each app’s `package.json`.

### Infrastructure (not in the VM update script)

Start backing services before API/web dev:

```bash
sudo service docker start   # if Docker is not running
docker compose -f infra/docker/compose.dev.yml up -d postgres postgres-vectors redis
```

Chat DB migrations (requires `DATABASE_URL` for Prisma CLI):

```bash
export DATABASE_URL=postgresql://columbus:columbus@localhost:5432/columbus
make db-migrate
```

Default Postgres credentials match `infra/docker/compose.dev.yml` (`columbus` / `columbus`).

### Env files

- `apps/api/.env` — API when run on the host (`npm run dev` in `apps/api`). Needs at least `DATABASE_URL` and `OPENAI_API_KEY` for `/api/chat`.
- `apps/web/.env` — Next.js; set `NEXT_PUBLIC_API_URL=http://localhost:4000` so the browser reaches the Express API (not the Next origin).
- Docker Compose reads `apps/web/.env` for both `web` and `api` services; copy from `apps/api/.env.example` / root `.env.example` as needed. `apps/web/.env.example` is referenced in docs but may be absent—use the API example as the source of truth.

### Running dev servers

Typical host flow (two terminals or a tmux session):

```bash
cd apps/api && npm run dev    # port 4000
cd apps/web && npm run dev    # port 3000
```

Or full stack in Docker: `./infra/scripts/dev-up.sh` then `make db-migrate` with `DATABASE_URL` pointing at the compose Postgres service hostname when run inside a container.

### Lint / test / typecheck

| App | Commands |
|-----|----------|
| `apps/web` | `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` |
| `apps/api` | `npm run typecheck` |

Run `next dev` once before `npm run typecheck` in `apps/web` so `next-env.d.ts` and `.next/types` exist. CI installs only under `apps/web` with `npm ci`; this repo’s lockfile is at the **root**—prefer `npm ci` from the repo root for local/cloud VMs.

### Gotchas

- `/dev/messages` submits to **`POST /api/chat`** (OpenAI), not `POST /api/messages`. Message persistence alone is verifiable via `curl` against `/api/messages` on port 4000.
- Without `OPENAI_API_KEY`, chat returns a configuration error; health and DB-backed `/api/messages` still work.
- `make db-migrate` fails if `DATABASE_URL` is unset in the shell (Prisma reads it from the environment, not from `apps/api/.env` automatically).
