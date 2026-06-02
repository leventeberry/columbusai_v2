# @columbusai/db

Prisma ORM **v7** package for Columbus AI (Postgres, multi-schema).

## Requirements

- **Node.js** `24+` (repo standard; Prisma 7 also supports `20.19+` and `22.12+`)
- `DATABASE_URL` in repo root `.env.local` or `.env.production` (see `COLUMBUS_ENV` in `prisma.config.ts`)

## Layout

| Path | Purpose |
|------|---------|
| `prisma.config.ts` | Database URL, migrations path, seed command |
| `prisma/schema/` | Multi-file Prisma schema (`@@schema` per Postgres schema) |
| `prisma/migrations/` | SQL migrations |
| `generated/prisma/` | Generated client (`prisma generate`) — gitignored |
| `src/client.ts` | `createPrismaClient()` / `getPrismaClient()` with `@prisma/adapter-pg` |

## Commands

```bash
cd packages/db
pnpm db:generate           # prisma generate
pnpm db:migrate:deploy     # production migrations
pnpm db:migrate:status
pnpm db:seed
```

### Auth + portal seed (local)

From the repo root, point `DATABASE_URL` at the host-visible Postgres port (not the Docker service hostname `postgres` unless you run the command inside the container):

```bash
DATABASE_URL=postgresql://columbus:columbus@localhost:5432/columbus \
  pnpm --filter @columbusai/db exec tsx prisma/seed-auth-portal.ts
```

Uses `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from the active env file. Re-run after changing seed passwords so `auth.users` hashes stay in sync.

## App usage

```typescript
import { getPrismaClient, Prisma, type SalesLead } from "@columbusai/db";

const prisma = getPrismaClient();
```

Do **not** instantiate `new PrismaClient()` without the pg driver adapter in Prisma 7.

## Multi-schema (Postgres)

Use `schemas = [...]` on the datasource and `@@schema("auth")` on models. The old `previewFeatures = ["multiSchema"]` flag is **not** used in v7.
