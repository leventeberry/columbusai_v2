# Hostinger API automation

TypeScript scripts under [`scripts/hostinger/`](../scripts/hostinger/) use the official [`hostinger-api-sdk`](https://github.com/hostinger/api-typescript-sdk) and repo-root `.env`.

## Prerequisites

1. API token from [hPanel → Profile → API](https://hpanel.hostinger.com/profile/api).
2. Set in `.env` (see [`.env.example`](../.env.example)):
   - `HOSTINGER_API_TOKEN` (required)
   - `HOSTINGER_VPS_IP` (default `147.93.113.58`)
   - `HOSTINGER_DOMAIN` (default `columbusai.tech`)
   - `HOSTINGER_SSH_PUBLIC_KEY_PATH` (default `~/.ssh/id_ed25519.pub`)
   - `HOSTINGER_GITHUB_COMPOSE_URL` (default `https://github.com/leventeberry/columbusai_v2`)
   - `HOSTINGER_DOCKER_PROJECT_NAME` (default `columbusai-prod`)
3. VPS must use a **Docker-capable OS template** for Docker Manager deploys.
4. GitHub repo must be **public** (or Docker Manager cannot pull compose without credentials).

## Commands

| npm script | Script | Purpose |
|------------|--------|---------|
| `hostinger:list-vms` | `list-vms.ts` | List VMs (id, IP, template) |
| `hostinger:provision` | `provision-vps.ts` | Firewall + SSH key + DNS |
| `hostinger:provision:firewall` | `provision-firewall.ts` | Open SSH/HTTP/HTTPS only |
| `hostinger:provision:ssh` | `provision-ssh-key.ts` | Register and attach SSH pubkey |
| `hostinger:provision:dns` | `provision-dns.ts` | A records for apex + subdomains |
| `hostinger:check-auth` | `check-auth.ts` | Verify `HOSTINGER_API_TOKEN` before other commands |
| `hostinger:deploy:all` | `deploy-all.ts` | Provision + Docker Manager; SSH fallback instructions if OS unsupported |
| `hostinger:deploy` | `deploy-docker.ts` | Docker Manager project from GitHub URL |
| `hostinger:deploy -- --status` | | Project list JSON |
| `hostinger:deploy -- --logs` | | Tail aggregated compose logs |
| `hostinger:verify-env` | `verify-env.ts` | Preflight `.env`, SSH key file, compose paths |

## API endpoints used

| Step | Hostinger API |
|------|----------------|
| Resolve VM | `GET /api/vps/v1/virtual-machines` |
| Firewall | `GET/POST /api/vps/v1/firewall`, rules, activate, sync |
| SSH key | `GET/POST /api/vps/v1/public-keys`, attach |
| DNS | `GET/PUT /api/dns/v1/zones/{domain}` (+ validate) |
| Deploy | `POST /api/vps/v1/virtual-machines/{id}/docker` |
| Poll | `GET .../actions/{actionId}` |

Base URL: `https://developers.hostinger.com`  
Auth: `Authorization: Bearer HOSTINGER_API_TOKEN`

## Idempotency

- **Firewall:** Finds firewall by name `HOSTINGER_FIREWALL_NAME`; adds missing SSH/HTTP/HTTPS accept rules; activates and syncs.
- **SSH:** Reuses account key with matching `key` body; skips attach if already on VM.
- **DNS:** Merges A records (`overwrite: false`); skips if all hosts already point at `HOSTINGER_VPS_IP`.
- **Docker:** `createNewProject` replaces an existing project with the same name.

## Limits and risks

| Constraint | Mitigation |
|------------|------------|
| Docker `content` max 8192 chars | Use GitHub URL, not inlined `compose.prod.yml` (~10KB) |
| Docker `environment` max 8192 chars | Allowlist in [`lib/docker-env.ts`](../scripts/hostinger/lib/docker-env.ts) |
| Default firewall drops all inbound | Must add accept rules before SSH works |
| DNS API only for Hostinger zones | Script warns and skips if zone not found |
| Rate limit 429 | Exponential backoff in [`lib/client.ts`](../scripts/hostinger/lib/client.ts) |
| Compose `include` + monorepo builds | If deploy fails, use manual SSH + `make up-prod` |

## Environment allowlist (Docker Manager)

Injected from `.env` at deploy time: `DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `CORS_ORIGIN`, `OPENAI_*`, `VITE_*`, `SESSION_SECRET`, n8n basic auth, etc. See `DOCKER_ENV_ALLOWLIST` in [`scripts/hostinger/lib/docker-env.ts`](../scripts/hostinger/lib/docker-env.ts).

Secrets are sent to Hostinger only in the deploy request body; they are not stored in the repo.

## Related docs

- [deployment-runbook.md](deployment-runbook.md) — routing, verification, backups
- [vps-ssh-setup.md](vps-ssh-setup.md) — SSH config and troubleshooting
