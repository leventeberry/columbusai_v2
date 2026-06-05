# Current Sprint

**Status:** Active sprint definition  
**Last updated:** June 2026  
**Primary references:** [First Sellable Product](../product/first-sellable-product.md), [Admin Portal](../product/admin-portal.md), [Lead Lifecycle](../workflows/lead-lifecycle.md)

---

## Sprint 3

**Theme:** Operational Trust — remove mock noise, harden the canonical funnel, make automation visible in the lead record

Sprint 3 makes the admin home dashboard trustworthy and closes observability gaps on the path that already works (marketing demo → sales.leads → admin CRM → n8n follow-up).

### Sprint 3 Scope

**In scope:**

1. Remove mock dashboard tasks and unread-messages KPI
2. Improve dashboard error messages (session vs API vs permissions)
3. Wire marketing demo form to shared `@columbusai/leads` validation
4. Record `followup_sent` activity from n8n follow-up workflow
5. Record `lead_converted` activity on convert-to-opportunity
6. Shared `manualLeadSchema` in `@columbusai/leads` for API + admin
7. Run API integration tests in CI with Postgres

**Out of scope:**

- Chat-to-lead bridge
- Full workflow monitoring UI
- Legacy web intake retirement (Sprint 4)
- Messages/documents modules

### Sprint 3 Deliverables

1. **Dashboard mock removal** — no `SEED_TASKS` or fake unread KPI; clearer error UX
2. **Shared validation** — marketing form + manual lead create use `@columbusai/leads/validation`
3. **Follow-up visibility** — n8n writes `followup_sent` to `sales.lead_activity`
4. **Convert audit** — `lead_converted` activity on opportunity creation
5. **CI integration job** — Postgres service + `pnpm --filter api test:integration`

### Sprint 3 Success Criteria

- Dashboard home shows only live-derived tasks
- No fake unread count on KPI row
- Marketing form validates with shared backend schema
- Follow-up email appears in activity feed for test leads
- Convert-to-opportunity creates activity event
- Integration tests run in CI

---

## Sprint 2 (completed)

**Theme:** Lead Intake + Follow-Up Workflow

Sprint 2 adds the operational loop that makes the dashboard valuable: leads enter the system, follow-ups are scheduled, statuses progress through the documented lifecycle, and all changes are recorded as real activity events.

### Sprint 2 Scope

**In scope:**

1. Manual lead creation (admin dialog + POST /api/leads)
2. Lead status workflow: New -> Contacted -> Qualified -> Proposal Sent -> Won/Lost
3. Editable lead notes with PATCH /api/leads/:id/notes
4. Activity event log (lead_created, status_changed, note_updated)
5. Real activity feed on dashboard (replaces mock data)
6. Activity timeline in lead detail panel
7. "Contacted" column in pipeline kanban
8. Status change controls in lead detail panel

**Out of scope:**

- Public lead capture forms
- AI scoring or enrichment
- Email sequences or full task CRUD
- Documents, messaging, client portal, billing, or AI modules

### Sprint 2 Deliverables

1. **Schema migration** - `contacted` added to SalesLeadStatus, SalesLeadActivity table
2. **Activity API** - recordLeadActivity, listLeadActivity, listRecentActivity (Prisma client)
3. **Lead creation API** - POST /api/leads with Zod validation + activity event
4. **Notes/status API** - PATCH notes, PATCH status with activity recording
5. **Create lead dialog** - Admin UI wired to "New lead" button on leads page
6. **Lead detail panel** - Editable notes, status selector, real activity timeline
7. **Dashboard activity** - Live events from GET /api/activity/recent replace mock feed
8. **Pipeline update** - "Contacted" column, attention queue handles contacted leads

### Sprint 2 Success Criteria

- Admin can create a lead manually
- Lead appears in dashboard attention queue
- Lead status can move through the documented lifecycle
- Lead notes can be edited and saved
- Activity events record creation, notes, and status changes
- Dashboard activity feed shows real events
- Typecheck, build, and tests pass

---

## Sprint 1 (completed)

**Theme:** Build Admin Dashboard MVP

This sprint is the first implementation sprint that turns the product and architecture documentation into a concrete owner-facing operational experience.

The goal is to build the smallest useful Admin Dashboard that helps a business owner understand, within 30 seconds, what requires attention right now.

This sprint should prioritize operational visibility over breadth.

---

## Sprint Objective

Deliver an MVP admin dashboard experience that gives the owner immediate visibility into:

- new leads
- leads requiring follow-up
- tasks requiring attention
- recent activity
- core KPI snapshots

This sprint should create the foundation for later admin pages without trying to complete the entire platform in one pass.

---

## Sprint Scope

### In scope

1. Dashboard shell
2. Leads page
3. Lead detail page
4. Tasks widget
5. Activity feed
6. KPI cards

### Out of scope

The following are intentionally not Sprint 1 priorities unless required to support the listed MVP work:

- full documents module
- full messaging module
- full automations management UI
- advanced analytics dashboards
- billing
- marketplace or enterprise features
- workflow builder functionality
- native mobile features

---

## Sprint Deliverables

### 1. Dashboard shell

Create the structural dashboard experience that will become the owner's home screen.

**Purpose:**

- Establish the MVP admin portal landing page
- Define layout, priority zones, and information hierarchy

**Must include:**

- page header
- primary KPI card row
- operational widgets section
- recent activity section
- clear drill-down paths into detail pages

**Success criteria:**

- The dashboard reads as an operations center, not a reporting page
- The most important information is visible without scrolling deeply

---

### 2. Leads page

Create the operational list view for leads.

**Purpose:**

- Give the owner a clear place to manage active prospects

**Must include:**

- lead table or list
- stage visibility
- last activity
- next follow-up
- filters for urgent operational use

**Success criteria:**

- The owner can identify which leads need action immediately
- The page reflects the documented lead lifecycle rather than ad hoc statuses

---

### 3. Lead detail page

Create a focused lead detail experience that supports action and context.

**Purpose:**

- Make it easy to review a single lead and decide the next step

**Must include:**

- lead profile summary
- current stage
- notes
- activity history
- communication/follow-up context
- clear next-action controls

**Success criteria:**

- The owner can open a lead and understand status, context, and next step without leaving the page repeatedly

---

### 4. Tasks widget

Create a dashboard widget that surfaces tasks requiring attention.

**Purpose:**

- Make today’s work visible from the home screen

**Must include:**

- due today
- overdue
- priority indication
- deep links to task or related record

**Success criteria:**

- The owner can immediately identify overdue or urgent work
- The widget supports action, not passive browsing

---

### 5. Activity feed

Create a recent activity component for operational context.

**Purpose:**

- Show what changed across leads, clients, tasks, and workflows

**Must include:**

- recent status changes
- recent follow-up-related activity
- recent task or onboarding events
- timestamps and linked record context

**Success criteria:**

- The owner can quickly understand what changed since last login
- The feed supports triage rather than becoming noise

---

### 6. KPI cards

Create a minimal KPI card set focused on operational value.

**Purpose:**

- Give the owner immediate quantitative context

**Recommended MVP cards:**

- new leads
- follow-ups due
- active clients
- overdue tasks

**Rules:**

- KPI cards must connect to action or urgency
- Do not include vanity metrics
- Do not turn Sprint 1 into a reporting build

**Success criteria:**

- KPI cards improve orientation without distracting from action widgets

---

## Functional Priorities

The order of importance for Sprint 1 should be:

1. Make urgent work visible
2. Make lead follow-up clear
3. Make next actions obvious
4. Make context easy to access
5. Make the dashboard feel trustworthy and focused

Notably, Sprint 1 should not optimize for:

- customization
- enterprise flexibility
- dense analytics
- aesthetic polish over workflow clarity

---

## Data Priorities

Sprint 1 should primarily rely on the documented operational data model:

- `sales.leads`
- lead status / follow-up fields
- `sales.clients`
- task/work-item data where relevant
- recent activity records

Where implementation gaps exist, prefer the smallest safe path that preserves the documented long-term model rather than inventing a separate temporary product model.

---

## UX Priorities

Sprint 1 UI should optimize for:

- clarity over density
- urgency over completeness
- actionable summaries over passive charts
- obvious drill-downs over hidden navigation
- mobile-aware layouts where reasonable

UI patterns should follow:

- [Admin Portal](../product/admin-portal.md)
- [Product Rules](../cursor/product-rules.md)
- [Implementation Rules](../cursor/implementation-rules.md)

---

## Acceptance Criteria

Sprint 1 is successful if an owner can log in and quickly answer:

- Do I have new leads?
- Which leads need follow-up?
- What work is overdue?
- What changed recently?
- Where should I click next?

If the dashboard still feels like a generic SaaS homepage or passive reporting surface, Sprint 1 is not complete.

---

## Guardrails

During Sprint 1:

- Do not add undocumented lifecycle states
- Do not add extra admin navigation sections
- Do not let analytics overtake operations
- Do not build workflow-builder UX
- Do not add enterprise abstractions

If implementation pressure pushes outside these boundaries, stop and reconcile with the docs first.

---

## Dependencies

Sprint 1 depends on and should stay aligned with:

- [First Sellable Product](../product/first-sellable-product.md)
- [Admin Portal](../product/admin-portal.md)
- [Lead Lifecycle](../workflows/lead-lifecycle.md)
- [System Overview](../architecture/system-overview.md)
- [Project Rules](../cursor/project-rules.md)
- [Product Rules](../cursor/product-rules.md)
- [Architecture Rules](../cursor/architecture-rules.md)
- [Implementation Rules](../cursor/implementation-rules.md)

---

## Recommended Follow-Up After Sprint 1

If Sprint 1 lands successfully, the next likely priorities should be:

1. Complete Tasks page and task management workflows
2. Expand lead detail and qualification/proposal workflows
3. Build client list and client detail operational views
4. Add outstanding documents visibility
5. Improve automation failure visibility

Those should only happen after the dashboard MVP is coherent and operationally useful.
