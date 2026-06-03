# Demo follow-up templates (2-day / 7-day / 14-day)

Client-ready n8n workflow templates for multi-touch demo follow-up sequences. Schedules and email objectives are defined in one TypeScript registry — workflows are **generated** from that source of truth.

Columbus’s live env-driven workflow ([demo-follow-up-workflow.md](demo-follow-up-workflow.md)) is separate. Do **not** activate template workflows on Columbus unless you intentionally migrate.

## Template comparison

| Template | Touch days (from lead creation) | Emails | Objectives |
|----------|-----------------------------------|--------|------------|
| **2day** | 1, 2, 5, 7 | 4 | Reminder → Value → Social proof → Final close |
| **7day** | 1, 3, 7, 10, 14 | 5 | Reminder → Value → Social proof → Objection handling → Final close |
| **14day** | 1, 3, 7, 14, 21, 28 | 6 | Reminder → Value → Social proof → Objection handling → Re-engagement → Final close |

Scheduling is **absolute** from `sales.leads.created_at` (not relative gaps after each send).

## Source of truth

| Path | Purpose |
|------|---------|
| [`packages/leads/src/followup/templates.ts`](../packages/leads/src/followup/templates.ts) | Day schedules + objectives per template |
| [`packages/leads/src/followup/schedule.ts`](../packages/leads/src/followup/schedule.ts) | `nextFollowupAt()` for API lead insert |
| [`packages/leads/src/followup/emailCopy.ts`](../packages/leads/src/followup/emailCopy.ts) | Subject lines + headlines |
| [`infra/n8n/email/objectives/`](../infra/n8n/email/objectives/) | HTML body fragments per objective |

## Generated workflow files

Run after editing the registry or email fragments:

```bash
pnpm n8n:generate:followup-templates
```

Output (import manually — **not** pushed by bootstrap):

| File | n8n workflow name |
|------|-------------------|
| [`infra/n8n/workflows/templates/demo-follow-up-template-2day.workflow.json`](../infra/n8n/workflows/templates/demo-follow-up-template-2day.workflow.json) | `ColumbusAI_Demo_Follow_Up_2_Day` |
| [`infra/n8n/workflows/templates/demo-follow-up-template-7day.workflow.json`](../infra/n8n/workflows/templates/demo-follow-up-template-7day.workflow.json) | `ColumbusAI_Demo_Follow_Up_7_Day` |
| [`infra/n8n/workflows/templates/demo-follow-up-template-14day.workflow.json`](../infra/n8n/workflows/templates/demo-follow-up-template-14day.workflow.json) | `ColumbusAI_Demo_Follow_Up_14_Day` |

Generated JSON includes `"active": false`. Push to local n8n:

```bash
pnpm n8n:generate:followup-templates
pnpm n8n:push:followup-templates
```

## Client setup

1. Run DB migration (`followup_template` column on `sales.leads`).
2. Set **one** template on the API:
   ```env
   DEFAULT_FOLLOWUP_TEMPLATE=7day
   ```
   Valid values: `2day`, `7day`, `14day`. Unset = legacy Columbus 2-email flow (`followup_template` NULL).
3. Restart the API so new demo leads get `followup_template` + `next_followup_at` from the registry.
4. In n8n: **Import** the matching workflow JSON (Workflow menu → Import from file).
5. Configure **Postgres account** (`postgres:5432`, database `columbus`) and **SMTP account** credentials.
6. **Activate only that one** template workflow. Do not run multiple template workflows against the same leads.
7. Ensure n8n has `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` and `BOOKING_LINK` set (see [demo-follow-up-workflow.md](demo-follow-up-workflow.md)).

## How it works

```txt
POST /api/leads/demo
  → followup_template = DEFAULT_FOLLOWUP_TEMPLATE
  → next_followup_at = created_at + first touch day

Every 15 minutes (template workflow):
  → SELECT leads WHERE followup_template = '<id>' AND due
  → Switch on followup_count → objective email → UPDATE count + next absolute day
```

Legacy Columbus leads (`followup_template IS NULL`) are handled only by the live `ColumbusAI_Demo_Follow_Up` workflow.

## Verification

1. `pnpm n8n:generate:followup-templates` — three JSON files updated.
2. `pnpm typecheck` passes.
3. Set `DEFAULT_FOLLOWUP_TEMPLATE=7day`, submit demo, confirm DB: `followup_template='7day'`, `next_followup_at ≈ created_at + 1 day`.
4. Import template into n8n, force due lead, confirm email sends and `followup_count` increments with next day scheduled from `created_at`.
