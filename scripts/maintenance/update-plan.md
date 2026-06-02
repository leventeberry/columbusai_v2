# Dependency update plan

Generated: 2026-06-02. Review after each `pnpm maintenance:logs` run.

## Phase A — Patch / safe minor (applied)

| Package | From | To | Workspaces | Rationale |
|---------|------|-----|------------|-----------|
| `next` | 16.1.6 | 16.2.7 | web | Security advisories (>=16.2.5) |
| `eslint-config-next` | 16.1.6 | 16.2.7 | web | Align with Next |
| `react` / `react-dom` | 19.2.3 | 19.2.7 | web (+ lockfile for TanStack apps) | Patch within React 19 |
| `dotenv` | 16.6.1 | 17.4.2 | packages/db | Align with root; no API break for load |
| `eslint-plugin-react-refresh` | ^0.4.20 | ^0.5.2 | admin, marketing, portal | Minor; new HOC lint hints only |
| `tar` (override) | <7.5.11 | >=7.5.11 | root | Transitive via `@cursor/sdk` → sqlite3 |
| `undici` (override) | <6.24.0 | >=6.24.0 (resolves 8.3.0) | root | Transitive via `@cursor/sdk` → `@connectrpc/connect-node` |
| `openai` | 4.104.0 | 6.41.0 | api, web | Maintenance Prompt 4; no app code changes; rebuild `api` Docker image for dev |
| `redis` | 4.7.1 | 6.0.0 | api, web | Maintenance Prompt 5; chat rate limit only; no app code changes; rebuild `api` Docker image for dev |

**Audit impact:** 33 → 8 (Phase A tar/Next) → **3** after undici override (0 high; remaining: `@hono/node-server`, `postcss`, `@tootallnate/once`).

## Phase B — Framework updates (deferred)

| Package | Current | Latest | Risk | Notes |
|---------|---------|--------|------|-------|
| TanStack Router / Start | 1.168.x | newer | Medium | Test all routes + SSR after bump; peers declare Vite 8 OK |
| Vite | 8.0.16 | 8.0.16 | — | **Done** — Maintenance Prompt 6b; hand-rolled `infra/vite/tanstack-start.ts`; see Phase F |
| Prisma | 7.8.0 | track 7.x patches | Low–medium | Stay on 7.x; read release notes |
| Express | 4.22.x | 5.x | High | Done — api on Express 5.2.1 |
| TypeScript | 5.9.x | 6.x | High | Whole monorepo |
| Zod | 3.25.x | 4.x | High | All apps + leads package |

**Process:** One workspace or one vertical at a time; run `pnpm maintenance:check` + `make smoke` + demo curl.

## Phase C — Breaking majors (do not batch)

- ESLint 9 → 10 (`@eslint/js`, flat config migration)
- `lucide-react` 0.x → 1.x (icon import changes)
- `react-day-picker` 9 → 10
- `@vitejs/plugin-react` 5 → 6 — **Done** with Vite 8 (marketing/admin/portal)
- `@types/node` 22 → 25 (split web @20 vs rest @22 first)
- `jest` 29 → 30 (web only)

## Phase D — Legacy `apps/web`

| Option | When |
|--------|------|
| Patch only (`next`, `react`) | Now — done in Phase A |
| Isolate in CI | Optional separate `pnpm --filter web` job |
| Defer majors | Until marketing fully replaces web |
| Remove | Product decision — not in this audit |

## Phase E — Tooling (optional)

| Item | Notes |
|------|-------|
| pnpm 10.12.4 → 11.x | Docker images use 10.12.4 via corepack; upgrade repo-wide |
| Node 26 | Required by engines; CI/WSL must use Node 26+ |
| `nitro` beta | Do not bump to newer beta without testing; peer `jiti@^2` unmet |
| `@cursor/sdk` | Dev-only; consider pin + periodic audit vs `latest` |

## Phase F — Vite 8 (Maintenance Prompt 6b, 2026-06-02) — **applied**

**Scope:** `apps/marketing`, `apps/admin`, `apps/portal` only.

### What changed

| Package | From | To |
|---------|------|-----|
| `vite` | 7.3.5 | 8.0.16 |
| `@vitejs/plugin-react` | 5.2.0 | 6.0.2 |
| `@lovable.dev/vite-tanstack-config` | 2.3.1 | **removed** |

- Shared factory: [`infra/vite/tanstack-start.ts`](../../infra/vite/tanstack-start.ts) — `tailwindcss`, `vite-tsconfig-paths`, `tanstackStart` (+ `importProtection` defaults), `nitro` (build-only, `node-server`, output `dist/`), `@vitejs/plugin-react`, `VITE_*` defines, Lightning CSS, `@` alias, React/Query dedupe, `PORT` / per-app default port.
- Omitted (Lovable-only): dev-server-bridge, HMR-gate, componentTagger, SSR/server-fn error logger plugins.
- Runtime: [`lovable-error-reporting.ts`](../../apps/marketing/src/lib/lovable-error-reporting.ts) unchanged in app code.
- Docker: copy `infra/vite` into dev/build stages; `.dockerignore` negates `!infra/vite` under `infra` exclude.

### Verification (2026-06-02)

- `pnpm typecheck`, `pnpm lint` (warnings only), `pnpm --filter {marketing,admin,portal} build` → `dist/server/index.mjs`
- `docker compose` rebuild + `make smoke` — marketing 200, portal/admin 307, API health OK

### Peer warnings (unchanged)

```
apps/admin → nitro → unmet jiti@^2.6.1 (found 1.21.7)
```

Pre-existing; do not bump Nitro beta solely to silence.

### Rollback (Vite 8)

Revert `infra/vite/tanstack-start.ts`, restore Lovable-based `vite.config.ts`, restore `vite@^7` + `@vitejs/plugin-react@^5`, `pnpm install`, rebuild Docker images.

## Rollback

```bash
git revert <commit>
pnpm install
pnpm maintenance:check
make smoke
```

## Next cycle

Run `pnpm maintenance:logs` monthly or before each release tag. Re-run Phase B items one at a time when scheduled.
