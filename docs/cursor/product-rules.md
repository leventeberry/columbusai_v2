# Columbus AI Product Rules

**Status:** Cursor product guidance  
**Last updated:** June 2026  
**Primary references:** [First Sellable Product](../product/first-sellable-product.md), [Admin Portal](../product/admin-portal.md)

---

## Purpose

This document defines how Cursor should think about product behavior when working on Columbus AI.

It is not a feature list. It is a set of behavioral rules for product decisions, screen design, workflow handling, and UX prioritization.

Use this document when deciding:

- how a screen should behave
- what information should be shown first
- what actions should be easy or hard
- whether a workflow belongs in MVP
- whether a product choice helps or hurts usability

---

## Primary Product Positioning

Columbus AI is a **Client Operations System** for small service businesses.

Product behavior should optimize for:

- operational clarity
- speed to action
- reduced manual work
- visible workflow state
- straightforward client and owner experiences

It should not optimize for:

- abstract feature completeness
- enterprise configurability
- passive reporting
- clever but hidden automation
- UI sophistication disconnected from business outcomes

---

## Primary Product Behavior Rules

### 1. Admin Portal is an operations center, not a reporting dashboard

The Admin Portal must help a business owner run the business today.

It should prioritize:

- urgent work
- blocked work
- overdue work
- operational movement

It should de-prioritize:

- passive charts
- vanity metrics
- historical reporting with no action attached

### 2. Every screen must answer: “What requires attention right now?”

This is the default test for admin-facing product behavior.

If a screen, card, widget, or page does not help the user identify attention-worthy work, its priority should be questioned.

### 3. Client Portal should prioritize simplicity, visibility, and task completion

Client-facing UX should focus on:

- what is happening
- what the client needs to do next
- what status their work is in
- where to upload or respond

The client should not have to decode internal terminology or learn complex navigation.

### 4. Users should never need training to understand primary actions

Primary actions should be obvious from the page itself.

Examples:

- respond to a lead
- mark a task complete
- upload a requested document
- open a blocked client record
- retry a failed operational step

If a user needs verbal explanation to discover the right action, the product behavior is too complex.

### 5. Do not hide important actions behind multiple clicks

Critical operational actions should be easy to reach, especially:

- follow-up actions
- status changes
- task completion
- document requests
- message replies
- workflow retries

If an action is high-frequency or urgent, it should not be buried.

---

## Workflow-First Product Rules

Product behavior should follow workflow state, not page boundaries.

### Core workflow anchors

All product decisions should reinforce these flows:

1. Lead capture
2. Lead follow-up
3. Qualification
4. Conversion to client
5. Onboarding
6. Active client management
7. Retention

### Workflow rules

- A lead should always have a visible next step.
- A client should always have a visible status.
- An onboarding flow should always have visible blockers.
- Missing documents should always be visible as work, not hidden as data.
- Failed automations should surface as operational issues.

---

## Admin Product Rules

### Dashboard behavior

The dashboard should be optimized for:

- triage
- prioritization
- drill-down into urgent work

The dashboard should not try to be:

- a complete reporting center
- a replacement for every operational page
- a dense BI tool

### Widget rules

A widget belongs on the dashboard only if it:

1. reveals urgency
2. identifies risk
3. highlights movement
4. leads directly to action

Widgets that do not support those outcomes should move to analytics or a detail page.

### Page hierarchy rules

The most important admin pages for MVP are:

1. Dashboard
2. Leads
3. Clients
4. Tasks
5. Documents
6. Messages
7. Automations

Analytics and Settings are secondary to daily operational work.

---

## Lead Experience Rules

- New leads should be visible immediately.
- Leads requiring follow-up should be more prominent than total lead counts.
- Stage changes should be easy to make and easy to understand.
- Qualification should collect only the information needed to decide next action.
- Proposal and close stages should preserve context, not reset it.
- Lost reasons should be structured enough to support reporting later.

### Lead UI priorities

Lead screens should make it easy to:

- identify urgency
- review latest communication context
- see next follow-up
- qualify or disqualify
- convert when appropriate

---

## Client Experience Rules

- Client records should show current status, not just profile information.
- Onboarding should behave like a visible checklist, not a hidden internal process.
- Client blockers should be easier to see than healthy background state.
- Work, documents, and messages should stay connected to the client record.
- Owners should be able to understand what is waiting on the client versus what is waiting on the business.

---

## Task Rules

- Tasks are operational commitments, not a generic productivity feature.
- Tasks should be tied to real business records whenever possible.
- Automation-generated tasks should be clearly marked.
- Overdue and due-today states should be visually obvious.
- Priority should reflect operational impact, not arbitrary labels.

---

## Document Rules

- Documents are part of workflows, not just stored files.
- Request state matters as much as storage state.
- Missing documents should create visible operational work.
- Clients should know exactly what is needed and where to provide it.
- Document UX should reduce resend/chase loops.

---

## Messaging Rules

- Communication should preserve business context.
- Internal notes and client-visible communication must be clearly separated.
- Messaging should support service and follow-up workflows, not become a standalone social feed.
- Unread or unresolved communication should surface operationally.

---

## Automation Rules

- Automation should remove repetitive work, not remove operator awareness.
- Workflow failures should always be visible.
- Human override should exist for important operational flows.
- A workflow is valuable only if its outcome is clear and its failure is recoverable.
- In MVP, automation visibility matters more than automation customization.

---

## Analytics Rules

- Analytics is secondary to operations in MVP.
- Trend and performance views should support decision-making, not distract from urgent work.
- If a metric has no likely action attached, it belongs later or elsewhere.
- Analytics should validate operational outcomes, not define the product direction on their own.

---

## Settings Rules

- Settings should contain configuration, not daily operational work.
- Integrations, branding, users, notifications, and security belong here.
- Do not move important day-to-day actions into Settings just because they are “advanced.”

---

## UX Simplicity Rules

### Primary action clarity

Every important page should have a clear primary action.

Examples:

- Leads page: review and move leads
- Client page: resolve blockers and monitor progress
- Tasks page: complete or assign work
- Documents page: request or review documents
- Messages page: reply or resolve

### Information density

Prefer:

- clear hierarchy
- grouped urgency
- obvious labels
- simple defaults

Avoid:

- overloading pages with equal-priority information
- making users infer state from scattered UI
- adding advanced filters before the default view is excellent

### Navigation clarity

Navigation should follow the operating model of the business.

Do not add navigation items unless they represent a durable product concept with real workflow value.

---

## MVP Product Boundaries

The following should remain out of scope unless documentation is deliberately updated:

- marketplace behavior
- billing workflows as a core product module
- advanced AI agents as central UX
- self-serve workflow builders
- enterprise hierarchy behavior
- white-label-first design
- mobile-native-specific UX assumptions

MVP should stay centered on:

- leads
- clients
- tasks
- documents
- messages
- automations
- dashboard visibility

---

## Product Conflict Rule

If a new feature or screen behavior conflicts with:

- [First Sellable Product](../product/first-sellable-product.md)
- [Admin Portal](../product/admin-portal.md)
- [Lead Lifecycle](../workflows/lead-lifecycle.md)

then stop implementation and resolve the product conflict first.

Do not let undocumented assumptions quietly change product behavior.

---

## Success Condition

This document is working if future Cursor sessions consistently produce product decisions that:

- make primary actions obvious
- keep the admin experience operational
- keep the client experience simple
- preserve workflow clarity
- reduce clicks for important work
- avoid drifting into passive dashboards or enterprise complexity
