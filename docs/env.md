# Environment files

Columbus AI uses **three environment files** at the repo root. Each file has the **same keys** in the **same order**; only values differ.

See also [local-development.md](local-development.md) for the canonical onboarding flow.

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
make up            # .env.local — default local startup
make up-dev        # .env.local — foreground logs (debug)
make up-staging    # .env.staging
make up-prod       # .env.production
make smoke         # HTTP health checks after make up
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

## Required for production

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PASSWORD` | Database (compose fails without it) |
| `OPENAI_API_KEY` | Chat API |
| `SESSION_SECRET` | Session signing (≥32 chars) |
| `WIDGET_SESSION_SECRET` | Widget conversation HMAC tokens (≥32 chars) |
| `REDIS_URL` | Fail-closed rate limiting |
| `CORS_ORIGIN` | Non-localhost origins |
| `COOKIE_DOMAIN` | Cross-subdomain session cookies (e.g. `.columbusai.tech`) |
| `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD` | n8n UI |
| `ADMIN_API_TOKEN` | n8n → API automation |

See [security-hardening.md](security-hardening.md) for deployment checklist.

## Compose vs env file

Compose **always** passes the matching `env_file` into services. Many values are **overridden** in compose `environment:` blocks (internal Docker hostnames, `NODE_ENV`, internal n8n webhook URLs). See comments at the top of each compose file.

## Hostinger deploy

[`scripts/hostinger/lib/docker-env.ts`](../scripts/hostinger/lib/docker-env.ts) injects a subset of keys from `.env.production` into Hostinger Docker Manager (8KB limit). Internal URLs (`COLUMBUS_API_URL`, container n8n webhooks) are set in compose only.

## Legacy `.env`

The old monolithic repo-root `.env` has been removed. Use `.env.local`, `.env.staging`, or `.env.production` only.
