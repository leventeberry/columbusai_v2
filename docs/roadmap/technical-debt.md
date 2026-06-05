# Technical Debt

**Last updated:** June 2026

This document tracks known workarounds and cleanup items. Resolve items before treating related areas as production-hardened.

---

## Prisma CLI and Node.js version

### Issue

The monorepo requires **Node.js >= 26** (`package.json` `engines`, `packages/db` and `apps/api`).

When the shell uses **Node 20** (for example Cursor’s bundled Node at `~/.cursor-server/bin/.../node`), every `prisma` subcommand fails with:

```text
Error [ERR_REQUIRE_ESM]: require() of ES Module .../zeptomatch/... from .../@prisma/dev/.../state.cjs
```

### Impact

- `prisma migrate dev`, `prisma db push`, and `prisma generate` cannot run until Node 26 is active on `PATH`.
- Developers may accidentally edit generated files by hand.

### Required cleanup

1. Use Node 26 locally: `nvm install 26 && nvm use 26` (see repo `.nvmrc`).
2. Ensure `which node` resolves to NVM’s Node 26 **before** `pnpm` / `prisma` (Cursor’s shell may prepend its own Node).
3. After schema changes, always run from repo root:
   - `pnpm db:generate`
   - `pnpm db:build`
4. Prefer `pnpm db:migrate:deploy` (or `prisma migrate deploy`) over hand-editing `src/generated`.

### Status (Sprint 2 verification)

- Node 26.3.0 installed via nvm.
- `prisma migrate deploy` applied migration `20260605120000_add_contacted_status_and_lead_activity`.
- `prisma generate` succeeded; manual enum patch in `enums.ts` is **superseded** by generated output when using Node 26.

---

## Sprint 2: SalesLeadActivity (resolved)

### Previous workaround

`apps/api/src/lib/sales/activity.ts` used `$queryRaw` against `sales.lead_activity` because the Prisma client had not been regenerated after adding `SalesLeadActivity`.

### Resolution

After `prisma generate` on Node 26, activity CRUD uses `prisma.salesLeadActivity` (typed client).

### Do not regress

- Do not reintroduce raw SQL for activity unless a Prisma limitation is documented here with a ticket.

---

## Local development: Postgres

### Requirement

Sprint 2 features need Postgres with migrations applied:

```bash
docker compose --env-file .env.local -f infra/docker/compose.dev.yml up -d postgres
pnpm db:migrate:deploy
```

### Verification

- Table `sales.lead_activity` exists with FK to `sales.leads`.
- Enum `sales.SalesLeadStatus` includes `contacted`.
- Indexes: `lead_activity_lead_id_created_at_idx`, `lead_activity_created_at_idx`.

---

## Integration and smoke tests

### API

Run against a live DB:

```bash
export PATH="$HOME/.nvm/versions/node/v26.3.0/bin:$PATH"
pnpm --filter api test:integration
```

Covers: create lead, activity events, status/notes patches, convert-to-opportunity, activity list endpoints, `SalesLead.activity` relation.

### Admin

Admin UI flows depend on the same API via TanStack server functions. Adapter-level smoke tests live in `apps/admin/src/lib/dashboard/sprint2-admin.smoke.test.ts`. Full browser verification (create dialog, side panel, dashboard feed) remains a manual checklist until Playwright or similar is added.

---

## Remaining items

| Item | Priority | Notes |
|------|----------|--------|
| Cursor/shell defaulting to Node 20 | High | Document in README; consider `engines` enforcement in CI only |
| Browser E2E for admin flows | Medium | Create lead dialog, notes save, status select, activity timeline |
| Workflow monitoring UI (mock) | Medium | Replace `workflow-monitoring.tsx` mock data when n8n visibility is scoped |
| Legacy `apps/web` lead intake split-brain | Medium | Sprint 4 — route to `/api/leads/demo` or retire |
| Demo lead path activity events | Resolved | `insertLead` records `lead_created` for demo_request leads |
| Dashboard `SEED_TASKS` / mock unread KPI | Resolved | Removed in Sprint 3 |
| Shared manual lead validation | Resolved | `manualLeadSchema` in `@columbusai/leads/validation` |
| Follow-up activity visibility | Resolved | n8n `demo-follow-up` writes `followup_sent` events |
| API integration tests in CI | Resolved | `.github/workflows/ci.yml` `integration` job |

---

## Commands reference

```bash
# Node 26 + Prisma
export PATH="$HOME/.nvm/versions/node/v26.3.0/bin:$PATH"
pnpm db:generate && pnpm db:build

# Migrations
pnpm db:migrate:deploy

# Verification
pnpm typecheck
pnpm build
pnpm --filter api test
pnpm --filter api test:integration
pnpm --filter admin test
```
