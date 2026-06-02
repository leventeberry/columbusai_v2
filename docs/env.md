# Environment files

Columbus AI uses **three environment files** at the repo root. Each file has the **same keys** in the **same order**; only values differ.

| Live file (gitignored) | Template | Docker Compose |
|------------------------|----------|----------------|
| `.env.local` | `.env.local.example` | [`compose.dev.yml`](../infra/docker/compose.dev.yml) |
| `.env.staging` | `.env.staging.example` | [`compose.staging.yml`](../infra/docker/compose.staging.yml) |
| `.env.production` | `.env.production.example` | [`compose.prod.yml`](../infra/docker/compose.prod.yml) |

## Setup

```bash
cp .env.local.example .env.local
cp .env.staging.example .env.staging      # when staging VPS exists
cp .env.production.example .env.production
# Fill in secrets (OpenAI, SESSION_SECRET, tokens, etc.)
```

```bash
make up-dev       # .env.local
make up-staging   # .env.staging
make up-prod      # .env.production
```

## Host-side tools

| Tool | Env file | Override |
|------|----------|----------|
| `pnpm n8n:*` (default) | `.env.local` | `COLUMBUS_ENV=production` for prod n8n API |
| `pnpm hostinger:*` | `.env.production` | `COLUMBUS_ENV=staging` if needed |
| Prisma (`db:migrate*`, seed) | `.env.local` | `COLUMBUS_ENV=production` on VPS |

## Maintaining templates

Defaults live in [`env/profiles.ts`](../env/profiles.ts).

```bash
pnpm env:sync-examples   # regenerate .env.*.example
pnpm env:check           # verify key parity
```

## Compose vs env file

Compose **always** passes the matching `env_file` into services. Many values are **overridden** in compose `environment:` blocks (internal Docker hostnames, `NODE_ENV`, internal n8n webhook URLs). See comments at the top of each compose file.

## Hostinger deploy

[`scripts/hostinger/lib/docker-env.ts`](../scripts/hostinger/lib/docker-env.ts) injects a subset of keys from `.env.production` into Hostinger Docker Manager (8KB limit). Internal URLs (`COLUMBUS_API_URL`, container n8n webhooks) are set in compose only.

## Legacy `.env`

The old monolithic repo-root `.env` has been removed. Use `.env.local`, `.env.staging`, or `.env.production` only.
