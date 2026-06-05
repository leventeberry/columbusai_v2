# Columbus AI Implementation Rules

**Status:** Cursor implementation workflow guidance  
**Last updated:** June 2026  
**Primary references:** [First Sellable Product](../product/first-sellable-product.md), [Admin Portal](../product/admin-portal.md), [Lead Lifecycle](../workflows/lead-lifecycle.md), [System Overview](../architecture/system-overview.md)

---

## Purpose

This document defines the practical implementation rules that future Cursor sessions should follow before changing Columbus AI.

It exists to prevent undocumented behavior, conflicting workflows, accidental product drift, and implementation choices that bypass the project's documentation layer.

This file should be treated as the operational checklist for coding work.

---

## Required Reading Order Before Implementation

Before implementing a meaningful feature, workflow, page, schema change, or integration, read in this order:

1. [First Sellable Product](../product/first-sellable-product.md)
2. [Admin Portal](../product/admin-portal.md) if the change affects admin UX
3. [Lead Lifecycle](../workflows/lead-lifecycle.md) if the change affects leads, opportunities, or conversions
4. [System Overview](../architecture/system-overview.md) if the change affects data flow, services, or integrations

Then read any module-specific supporting docs that apply.

Examples:

- onboarding changes → also read [Onboarding](../product/onboarding.md)
- follow-up workflow changes → also read [Follow-up Workflow](../workflows/follow-up-workflow.md)
- deployment/infrastructure changes → also read [Deployment](../architecture/deployment.md)

---

## Core Implementation Rules

### 1. If a feature conflicts with documentation: stop and resolve the conflict

Do not “just implement” a behavior that conflicts with the docs because:

- the code already looks different
- a route already exists
- it feels like a better idea locally
- it is faster

If documentation and implementation conflict, pause and explicitly resolve the discrepancy.

### 2. Do not implement undocumented workflow behavior

If a change affects:

- lead stages
- client lifecycle
- onboarding behavior
- dashboard logic
- automation triggers
- document workflows
- messaging behavior

then the behavior should exist in the docs or be added to the docs as part of the work.

### 3. Do not create new status values without updating lifecycle documentation

Statuses are part of product behavior, not just code constants.

Do not add new values for:

- lead lifecycle
- task state
- onboarding state
- document state
- automation status

unless the relevant documentation is updated.

Relevant docs:

- [Lead Lifecycle](../workflows/lead-lifecycle.md)
- [First Sellable Product](../product/first-sellable-product.md)
- future module docs as they are added

### 4. Do not add navigation items without updating product documentation

If you add or materially change admin or portal navigation, update the relevant docs first or alongside implementation.

At minimum, check:

- [Admin Portal](../product/admin-portal.md)
- [First Sellable Product](../product/first-sellable-product.md)

Navigation is part of product architecture, not a casual UI detail.

---

## Documentation-Driven Change Process

For non-trivial work, use this sequence:

1. Read the relevant docs
2. Identify the workflow or product area being changed
3. Confirm whether the requested behavior is already documented
4. If documented, implement to match
5. If not documented but clearly required, update docs or flag the gap
6. Then implement

If the work changes product behavior, state transitions, or architecture significantly, documentation should be treated as part of the implementation.

---

## Feature Scoping Rules

### 1. Tie every feature to a documented outcome

Before implementation, identify which outcome area the feature supports:

- acquire
- onboard
- serve
- retain
- reduce manual work
- increase operational visibility

If a feature does not clearly support one of these, question whether it belongs in current scope.

### 2. Do not expand scope silently

If a simple request implies:

- new workflows
- new roles
- new lifecycle stages
- new infrastructure patterns
- new integrations

then call that out explicitly instead of hiding the complexity in implementation.

### 3. Prefer the smallest implementation that preserves the documented workflow

Do not overbuild.

Choose the narrowest solution that:

- supports the documented workflow
- preserves architectural clarity
- leaves room for future refinement

---

## UI Implementation Rules

### 1. Admin screens must support operational triage

Admin UI should emphasize:

- urgency
- next actions
- blockers
- attention-required items

Do not let admin screens drift into passive dashboards or decorative reporting pages.

### 2. Client screens must stay simple

Client-facing UI should prioritize:

- status visibility
- task completion
- document upload
- message clarity

Avoid internal jargon and overly dense workflows.

### 3. Important actions should stay obvious

Do not hide primary actions behind:

- deep nested menus
- unusual icon-only patterns
- multiple confirmation steps unless risk justifies them

### 4. Placeholder routes are not product approval

If a route already exists in the codebase, that does not automatically mean the feature belongs in MVP or should be expanded.

Always check the docs first.

---

## Workflow Implementation Rules

### 1. Preserve end-to-end flow integrity

Changes to one stage of the workflow should be checked against neighboring stages.

Examples:

- lead capture changes should be checked against follow-up
- qualification changes should be checked against proposal and won states
- client creation changes should be checked against onboarding

### 2. Keep state transitions explicit

Important transitions should be easy to reason about in code.

Avoid hidden transitions spread across:

- frontend-only state
- background scripts with no record updates
- automation logic with no platform trace

### 3. Workflow visibility matters as much as workflow execution

When implementing automations, also think about:

- how operators see status
- how failures surface
- how next human action is identified

---

## Data and Schema Change Rules

### 1. Check ownership before adding fields or tables

Ask:

- Which system should own this?
- Is this operational truth or derived state?
- Does this belong in an existing schema?

### 2. Do not use schema changes to compensate for unclear product behavior

If product meaning is unclear, solve the documentation/product question before encoding it in the database.

### 3. Schema changes affecting lifecycle or workflow must update docs

This includes:

- new stage columns
- new status enums or values
- new automation states
- new onboarding progression fields

---

## Automation Implementation Rules

### 1. n8n is orchestration, not business truth

When implementing workflow changes:

- durable entity state should remain in Postgres
- n8n should trigger, schedule, and coordinate
- admin visibility should not depend on manually reading workflow tools

### 2. Expose failures in platform terms

If an automation fails, implementation should make it possible to answer:

- what failed
- which record was affected
- what the operator should do next

### 3. Avoid one-off workflow logic with no documented place in the product

If a workflow step changes customer-facing behavior, it should have a documented home in the product and workflow docs.

---

## Integration Implementation Rules

### 1. Route core integrations through the documented architecture

All meaningful integrations should align with [System Overview](../architecture/system-overview.md).

### 2. Do not add integration-specific product concepts casually

Avoid shaping product behavior around a provider-specific idea unless it is intentionally adopted as a durable product concept.

### 3. Protect secrets and scopes

Keep credentials server-side and follow least privilege.

---

## Documentation Update Triggers

A documentation update is likely required if the implementation adds or changes:

- lifecycle stages
- navigation structure
- dashboard widget meaning
- onboarding behavior
- automation responsibility
- integration responsibility
- data ownership
- major MVP boundaries

If in doubt, update the doc or explicitly note why it was not needed.

---

## Conflict Escalation Rules

If you find a conflict between request and documentation:

1. Identify the conflicting docs
2. Explain the conflict clearly
3. Propose the smallest aligned path
4. Do not silently invent a third undocumented behavior

Examples of conflicts that should stop work:

- a request needs a new lead stage not in the lifecycle
- a new nav section is requested but not part of admin portal structure
- a workflow wants automation to own source-of-truth state
- an infrastructure change conflicts with the documented monolith-first model

---

## Default Implementation Heuristics

When multiple valid implementations exist, prefer the one that:

1. best matches documented workflows
2. keeps Postgres as the source of truth
3. keeps the API as the business boundary
4. minimizes user confusion
5. minimizes operational ambiguity
6. avoids enterprise complexity
7. preserves future flexibility without overbuilding now

---

## Success Condition

This document is working if future Cursor sessions consistently:

- read the docs first
- implement features that stay aligned with documented workflows
- catch documentation conflicts early
- avoid inventing hidden product behavior in code
- keep Columbus AI coherent across product, architecture, and implementation
