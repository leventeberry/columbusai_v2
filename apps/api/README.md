# Columbus API Service

Backend API for chat and messages. Runs as a separate service from the Next.js web app.

## Setup

- **From repo root (recommended):** `npm install` then `cd apps/api && npm run dev`
- **Standalone:** From `apps/api`, run `npm install` (uses `file:../../packages/db` for Prisma).

Create `apps/api/.env` from `.env.example`, or use `apps/web/.env` when running via Docker Compose (compose uses web's env file for the api service).

## Run locally

```bash
# From repo root
cd apps/api && npm run dev
# Listens on PORT (default 4000)
```

## Endpoints

- `GET /api/health` → `{ "ok": true }`
- `POST /api/chat` — same contract as former Next.js route (conversationId, message)
- `GET /api/messages?conversationId=<uuid>`
- `POST /api/messages` — body: conversationId?, content, role?

## Docker

Build from **repo root**:

```bash
docker build -f apps/api/Dockerfile -t columbus-api .
docker run -p 4000:4000 --env-file apps/web/.env columbus-api
```

Compose (dev/prod) includes the `api` service; set `NEXT_PUBLIC_API_URL=http://localhost:4000` so the web app calls this service.

### Docker and env

- Compose passes `env_file: ../../apps/web/.env` to the `api` service, so the API container does **not** read `apps/api/.env`.
- Put all required API variables (e.g. `OPENAI_API_KEY`) in **`apps/web/.env`** when running with Docker.
- The `web` service gets `NEXT_PUBLIC_API_URL=http://localhost:4000` from compose so the chatbot can connect; for local-only web dev, set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `apps/web/.env` if the API runs on 4000.
