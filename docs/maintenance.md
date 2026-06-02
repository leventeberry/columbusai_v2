# Dependency and install health maintenance

Repeatable process for auditing installs, warnings, outdated packages, and safe updates across the Columbus AI pnpm monorepo.

## Prerequisites

- **Node 26+** (see root `engines`; Docker images use `node:26-alpine`)
- **pnpm 10.12.4** (via `packageManager` in root `package.json`)
- Docker running for stack smoke tests

## Capture logs

```bash
pnpm maintenance:logs
```

Or manually:

```bash
./scripts/maintenance/audit-deps.sh
```

Logs are written to `logs/maintenance/` (gitignored):

| File | Command |
|------|---------|
| `pnpm-install.log` | `pnpm install` |
| `pnpm-outdated.log` | `pnpm outdated -r` |
| `pnpm-audit.log` | `pnpm audit` |
| `typecheck.log` | `pnpm typecheck` |
| `lint.log` | `pnpm lint` |
| `build.log` | `pnpm build` |
| `docker-build.log` | `docker compose ... build` |

Quick audit without full log capture:

```bash
pnpm maintenance:audit
pnpm maintenance:check
```

## Review outdated packages

```bash
pnpm outdated -r
```

Exit code `1` only means outdated packages exist — not a failed install.

Classify each row in [scripts/maintenance/update-plan.md](../scripts/maintenance/update-plan.md):

- **Phase A** — patch / safe minor
- **Phase B** — framework (TanStack, Vite, Prisma, Express)
- **Phase C** — breaking majors (Zod 4, TS 6, ESLint 10)
- **Phase D** — legacy `apps/web` only

Do **not** run `pnpm update --latest -r` without a written phase plan.

## Apply updates safely

1. Create a git checkpoint (branch or commit on `main`).
2. Apply **one phase** from `update-plan.md`.
3. Run:

   ```bash
   pnpm install
   pnpm maintenance:check
   ```

4. Docker verification:

   ```bash
   make up          # or make restart if already running
   make smoke
   curl -sf http://localhost:4000/api/health
   ```

5. Demo workflow regression:

   ```bash
   curl -sS -X POST http://localhost:4000/api/leads/demo \
     -H "Content-Type: application/json" \
     -d '{
       "first_name":"Maintenance",
       "last_name":"Test",
       "email":"maintenance-test@example.com",
       "company":"Columbus AI",
       "what_automate":"Post-update smoke"
     }'
   ```

6. Commit only if all checks pass.

### pnpm overrides

Use root `package.json` → `pnpm.overrides` for **transitive** security fixes (e.g. `tar`, `undici` under dev-only `@cursor/sdk`). Re-run `pnpm audit` after changing overrides.

### Peer dependency warnings

After install, read the “Issues with peer dependencies” section. Example: `nitro` beta expects `jiti@^2` — defer until Nitro is upgraded intentionally.

## Rollback

```bash
git revert <commit-hash>
pnpm install
pnpm maintenance:check
make smoke
```

## Legacy `apps/web`

Marketing (`apps/marketing`) is the primary public site. `apps/web` (Next.js) remains for legacy/widget flows.

| Strategy | Use when |
|----------|----------|
| **Patch only** | Security fixes (`next`, `react`) — lowest risk |
| **Isolate CI** | `pnpm --filter web build` in a separate job |
| **Defer majors** | Zod 4, Jest 30, shadcn 4 until web is retired |
| **Remove** | After traffic and features move to marketing |

## Warning severity guide

| Severity | Examples | Action |
|----------|----------|--------|
| **Critical** | Failed build/typecheck, Prisma generate failure, high CVE in production path | Block release |
| **Important** | Node engine mismatch, outdated Next in web, deprecated majors available | Schedule Phase A/B |
| **Low** | react-refresh HOC hints, unused vars in web, pnpm “Update available” banner | Backlog |

## Canonical local commands

| Task | Command |
|------|---------|
| Start stack | `make up` |
| HTTP smoke | `make smoke` |
| Full verify | `make verify` (CI + smoke; needs running Docker) |

See [local-development.md](./local-development.md).

## Maintenance cadence

- **Monthly** — `pnpm maintenance:logs` + review `pnpm-outdated.log`
- **Before release tags** — `pnpm maintenance:check`, `make smoke`, demo curl
- **After security advisories** — targeted Phase A patch + `pnpm audit`
