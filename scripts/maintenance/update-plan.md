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

**Audit impact:** 33 → 8 (Phase A tar/Next) → **3** after undici override (0 high; remaining: `@hono/node-server`, `postcss`, `@tootallnate/once`).

## Phase B — Framework updates (deferred)

| Package | Current | Latest | Risk | Notes |
|---------|---------|--------|------|-------|
| TanStack Router / Start | 1.167.x | newer | Medium | Test all routes + SSR after bump |
| Vite | 7.3.x | 8.x | High | Major; retest Docker dev images |
| Prisma | 7.8.0 | track 7.x patches | Low–medium | Stay on 7.x; read release notes |
| Express | 4.22.x | 5.x | High | Done — api on Express 5.2.1 |
| Redis client | 4.x | 6.x | Medium | api + web connection options |
| TypeScript | 5.9.x | 6.x | High | Whole monorepo |
| Zod | 3.25.x | 4.x | High | All apps + leads package |

**Process:** One workspace or one vertical at a time; run `pnpm maintenance:check` + `make smoke` + demo curl.

## Phase C — Breaking majors (do not batch)

- ESLint 9 → 10 (`@eslint/js`, flat config migration)
- `lucide-react` 0.x → 1.x (icon import changes)
- `react-day-picker` 9 → 10
- `@vitejs/plugin-react` 5 → 6
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

## Rollback

```bash
git revert <commit>
pnpm install
pnpm maintenance:check
make smoke
```

## Next cycle

Run `pnpm maintenance:logs` monthly or before each release tag. Re-run Phase B items one at a time when scheduled.
