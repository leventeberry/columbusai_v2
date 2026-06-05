# Admin Dashboard MVP

**Status:** Pixel-level Sprint 1 specification  
**Last updated:** June 2026  
**Primary references:** [First Sellable Product](./first-sellable-product.md), [Admin Portal](./admin-portal.md), [Current Sprint](../roadmap/current-sprint.md)

---

## Purpose

Define exactly what a business owner sees when they log in tomorrow morning.

This is not a broad portal document. It is the **pixel-level MVP** for the admin home screen and the first operational lead workflow.

**Design test:** Within 30 seconds of login, the owner knows what requires attention.

---

## Login View

When the owner opens the admin portal after authentication, they land on **Dashboard** (`/dashboard`).

### Page header

- **Title:** Operations overview
- **Subtitle:** What needs your attention right now
- **No** executive reporting language
- **No** placeholder “Export” or “New workflow” actions in MVP

---

## Layout

```txt
┌─────────────────────────────────────────────────────────────┐
│ Page header: Operations overview                            │
├─────────────────────────────────────────────────────────────┤
│ KPI ROW (5 cards, equal width on desktop)                   │
│ New Leads | Active Clients | Tasks Due Today | Unread Msgs  │
│           | Pipeline Value                                  │
├──────────────────────────────┬──────────────────────────────┤
│ LEFT: Leads Requiring        │ RIGHT: Today's Tasks         │
│       Attention              │                              │
├──────────────────────────────┴──────────────────────────────┤
│ BOTTOM: Recent Activity Feed (full width)                   │
└─────────────────────────────────────────────────────────────┘
```

On mobile: KPI row stacks (2 columns), main columns stack vertically (leads first, then tasks), activity feed last.

---

## KPI Row

Five cards in this order:

| # | Label | Meaning | Data (Sprint 1) |
|---|-------|---------|-------------------|
| 1 | **New Leads** | Open/new leads needing awareness | Live — `sales.stats` / leads |
| 2 | **Active Clients** | Current client count | Live — `sales.stats` |
| 3 | **Tasks Due Today** | Work due today or overdue | Adapter — mock + derived from follow-ups |
| 4 | **Unread Messages** | Conversations needing response | Adapter — mock until unified inbox |
| 5 | **Pipeline Value** | Total open pipeline value | Live — `sales.stats` |

Each card: icon, label, large value, subtle sparkline (optional in MVP).

**Rule:** Every KPI must connect to urgency or orientation — not vanity metrics.

---

## Main Content — Left Column

### Leads Requiring Attention

**Purpose:** Operational queue — not a full kanban on the dashboard.

**Shows (max ~8 items, scroll if more):**

- Company name
- Contact name
- Attention reason badge (e.g. Overdue follow-up, Due today, New lead)
- Next follow-up date/time if applicable
- Quick action: open lead in side panel

**Priority order:**

1. Overdue follow-up (`next_followup_at` in the past, status still active)
2. Due within 24 hours
3. Created in last 48 hours (new)
4. Qualified with no recent activity

**Empty state:** “No leads need immediate attention” with link to Leads page.

**Data:** Live — `GET /api/leads` via admin hooks.

---

## Main Content — Right Column

### Today's Tasks

**Purpose:** Surface work due today across onboarding, follow-up, and ops.

**Each row:**

- Task title
- Priority chip (low / medium / high / critical)
- Due label (Today, Overdue, or date)
- Related record (lead or client name)
- Checkbox or “Mark complete” (MVP: visual only if no API)

**Sections within widget:**

- Overdue (red accent)
- Due today
- Optional: no more than 6 visible items

**Data:** Adapter — seeded tasks + derived follow-up tasks until admin tasks API exists.

---

## Bottom Row

### Recent Activity Feed

**Purpose:** Timeline of what changed since last visit.

**Each event:**

- Icon by type
- Primary line (action)
- Secondary line (target / record)
- Relative time

**Event types (MVP):**

- Lead created
- Lead stage changed
- Follow-up sent
- Opportunity won
- Client created
- Onboarding task created

**Data:** Adapter — mock audit-shaped events; swap to live `audit_events` API later.

---

## Primary Navigation (Sprint 1)

Only these items in the **primary** nav group:

| Item | Route |
|------|-------|
| Dashboard | `/dashboard` |
| Leads | `/sales/leads` |
| Clients | `/clients` |
| Tasks | `/tasks` |
| Documents | `/documents` |
| Messages | `/messages` |
| Settings | `/admin/settings` |

Secondary/advanced areas (provisioning, automation, analytics) are **de-emphasized** or moved to a secondary group until post-Sprint 1.

---

## Leads Page (`/sales/leads`)

Below the dashboard, the owner uses the full **Leads** experience:

- Page header + optional “New lead” (placeholder OK)
- Kanban pipeline (existing) OR list — Sprint 1 keeps kanban
- **Side panel** opens when a lead card is clicked (pipeline stays visible)
- URL: `/sales/leads?leadId=<uuid>` for shareable state

### Lead detail side panel

**Width:** ~480px (desktop), full screen sheet on mobile.

**Contents:**

- Company + contact + email
- Status badge + pipeline stage
- Follow-up: count, last sent, next due
- Notes (display `notes` field; edit MVP optional)
- Activity timeline (MVP: synthesized from lead metadata + mock events)
- Tasks linked to lead (from adapter)
- Primary action: **Convert to opportunity** (if not converted)
- Link to full page route for bookmarking

**Full-page route** `/sales/leads/$leadId` redirects to `?leadId=` for consistency.

---

## Explicitly Not on Dashboard (Sprint 1)

Remove or hide from dashboard home:

- Workflow monitoring
- AI agent control center
- System health widgets
- Revenue/analytics charts
- Full client table
- Full kanban pipeline on dashboard (pipeline stays on Leads page)

---

## Success Criteria

Sprint 1 dashboard MVP is done when:

1. Owner logs in and sees the layout above within 2 seconds of data load
2. KPI row shows live leads/clients/pipeline where APIs exist
3. Lead attention queue is live-backed
4. Tasks and activity use adapters without blocking UI
5. Clicking a lead on Leads page opens side panel without losing pipeline context
6. Navigation matches the 7-item Sprint 1 list

---

## Related Documentation

- [First Sellable Product](./first-sellable-product.md)
- [Admin Portal](./admin-portal.md)
- [Lead Lifecycle](../workflows/lead-lifecycle.md)
- [Cursor Implementation Rules](../cursor/implementation-rules.md)
