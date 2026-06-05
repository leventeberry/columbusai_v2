# Columbus AI Architecture Rules

**Status:** Cursor architecture guardrails  
**Last updated:** June 2026  
**Primary reference:** [System Overview](../architecture/system-overview.md)

---

## Purpose

This document defines the architectural rules that future Cursor sessions should follow when changing Columbus AI.

Its purpose is to protect the platform from accidental drift, duplicate systems, premature complexity, and implementation choices that conflict with the product model.

When a session is unsure how to structure a technical change, these rules should guide the decision.

---

## Primary Architectural Position

Columbus AI should remain:

- a shared platform
- centered on a single API layer
- backed by PostgreSQL as the source of truth
- deployed as a monolith-in-a-monorepo
- extended with automations, not fragmented into many independent systems

Architecture should make the product easier to understand, easier to operate, and faster to evolve.

---

## Core Architecture Rules

### 1. Monolith first

Do not introduce microservices without explicit documented justification.

The default architecture should remain:

- marketing app
- admin app
- portal app
- API
- PostgreSQL
- n8n
- shared deployment stack

This architecture is easier to reason about and well-matched to the current MVP scope.

### 2. Do not introduce microservices without documented justification

A service split should not happen because:

- “it might scale better later”
- “microservices are cleaner”
- “this module feels separate”

A split should only be considered if there is documented justification such as:

- clear operational isolation needs
- independently scaled workload
- security or compliance boundary
- domain complexity that cannot be managed sanely in the current platform

### 3. Use shared platform services

Shared concerns should stay shared:

- auth
- sessions
- audit behavior
- business logic
- lifecycle transitions
- notifications
- automation coordination

Do not recreate these independently inside each app.

### 4. Avoid duplicate implementations

Do not implement the same workflow in multiple places unless the duplication is intentional and documented.

Examples of duplication to avoid:

- lead status logic in both frontend and backend as separate truths
- portal-only document state separate from database state
- duplicate follow-up scheduling engines
- duplicate auth/session stacks

### 5. All integrations flow through the API layer

External integrations should be coordinated through the API layer or through automations that are explicitly tied back to API/database-owned records.

Do not let frontend apps become the long-term source of integration orchestration for core workflows.

Exceptions should be rare and documented.

### 6. PostgreSQL is the system of record

Postgres owns operational truth for:

- leads
- opportunities
- clients
- auth and sessions
- portal work items
- notifications
- workflow-relevant business state

Other systems may execute workflows or transport messages, but they should not become the authoritative source of operational truth.

### 7. Automations orchestrate workflows but do not become the source of truth

n8n is valuable for orchestration, scheduling, and provider coordination.

It should not become the primary owner of:

- lifecycle state
- lead records
- client status
- onboarding state
- document state

That truth belongs in PostgreSQL and the application layer.

### 8. Infrastructure changes must align with `system-overview.md`

Do not introduce infrastructure patterns that conflict with the current architectural model without updating the architecture documentation first.

If a proposed infrastructure change would materially alter:

- deployment topology
- service boundaries
- data ownership
- integration model
- security posture

then the architecture docs must be updated before or alongside implementation.

---

## Data Ownership Rules

### 1. One operational source of truth per concept

Every important domain concept should have a clear owning system.

Examples:

- lead lifecycle state → PostgreSQL + API rules
- onboarding work items → PostgreSQL + API rules
- auth/session state → PostgreSQL + API rules
- workflow execution logs → automation runtime, but business consequences reflected in platform data

### 2. Frontend apps do not own durable business truth

Marketing, admin, and portal apps may collect or present data, but durable operational state should live in backend-owned systems.

### 3. Provider state is not business truth

Email providers, calendars, analytics providers, and AI vendors may hold transport or execution data, but Columbus should own the business meaning of the interaction.

### 4. File storage should own binaries, not workflow state

When implemented, file storage should hold files while PostgreSQL stores:

- document metadata
- request state
- access relationships
- review status

---

## API Layer Rules

### 1. The API is the coordination boundary

The API should remain the central coordination layer for:

- validation
- authorization
- state transitions
- orchestration triggers
- audit-worthy business actions

### 2. Important workflow transitions should be explicit

Examples include:

- lead created
- lead qualified
- proposal sent
- opportunity won
- client created
- onboarding task generated
- automation failure requiring attention

These should not be hidden in ad hoc UI logic.

### 3. Do not bypass API rules for convenience

Avoid building shortcuts that let frontend code or scripts mutate critical business data outside the intended application layer unless explicitly documented and justified.

### 4. Keep external-webhook logic bounded

Webhook handling should validate input, control side effects, and write any durable outcomes back into owned platform data.

---

## Database Rules

### 1. Preserve schema clarity

The current schema segmentation is meaningful:

- `auth`
- `portal`
- `sales`
- `chat`
- `automation`

New tables or behaviors should respect these conceptual boundaries.

### 2. Do not invent undocumented status models

Statuses and lifecycle values are part of product behavior, not arbitrary implementation details.

Do not add new lifecycle or workflow states without checking and updating the relevant docs first.

### 3. Prefer additive, documented evolution

Evolve the database in ways that preserve clarity and migration safety.

Avoid hidden coupling and implicit meaning in loosely named columns.

### 4. Keep reporting derived from operational truth

Analytics and reporting tables can be added later, but primary workflow data should remain grounded in the core schemas.

---

## Frontend Architecture Rules

### 1. Do not duplicate business rules in multiple apps

If admin and portal share the same operational concept, prefer shared APIs and shared domain understanding rather than divergent frontend interpretations.

### 2. Navigation should reflect product architecture

Do not add major navigation concepts without verifying they belong in the documented product model.

### 3. Scaffolded UI is not architecture truth

Existing routes, placeholders, or mock pages should not be treated as proof that a feature belongs in the long-term architecture.

Always reconcile implementation with documentation, not just with what exists in the route tree.

### 4. Preserve mobile usability without creating mobile-only architecture

Responsive web is part of current product scope. Do not introduce mobile-native-specific backend complexity unless the roadmap and docs change.

---

## Automation Rules

### 1. Automations should operate on durable records

Workflows should read from and write to the platform's owned data model where possible.

### 2. Retryability matters

Automation design should favor observable, retryable workflows over opaque one-shot logic.

### 3. Workflow failures must be surfacable

Architecture should make it possible for admin UX to show:

- failed workflow
- affected record
- next human action

### 4. Avoid workflow logic becoming the only implementation of a rule

If a critical business rule exists only inside a workflow tool and nowhere in the documented platform model, that is a risk.

---

## Integration Rules

### 1. Integrations must support the documented workflows

Do not add integrations just because they are popular or available.

They should support:

- lead capture
- follow-up
- onboarding
- service delivery
- retention
- operational visibility

### 2. Prefer bounded integration responsibility

Each integration should have a clear purpose:

- messaging provider
- analytics provider
- calendar provider
- AI provider

Avoid integrations with overlapping, undefined ownership.

### 3. Treat integration credentials as infrastructure concerns

Secrets should be handled through environment/config systems, not embedded into app logic or frontend code.

### 4. Keep sensitive logic server-side

Provider auth, sync rules, and security-sensitive reconciliation logic should remain outside client apps.

---

## Security Architecture Rules

### 1. Security by default

Authentication, authorization, auditability, and data scoping are first-order architectural requirements.

### 2. Least privilege

Grant only the access needed to perform the intended action.

This applies to:

- user roles
- internal service access
- integrations
- workflow credentials

### 3. Client-visible and internal-visible data must stay distinct

Portal and admin experiences must not blur internal notes and client-facing data.

### 4. Audit significant state changes

Client provisioning, role changes, important lifecycle transitions, and high-impact actions should remain observable and traceable.

---

## Infrastructure Rules

### 1. Keep the deployment model simple

The current Docker + Traefik + VPS model is appropriate for the present stage of the product.

Do not introduce orchestration complexity without strong operational need.

### 2. Environment parity matters

Local, staging, and production should remain close enough that workflow and infrastructure behavior can be reasoned about confidently.

### 3. Operational visibility matters more than novelty

Logs, health checks, deploy verification, and backup discipline are more important than moving to a more fashionable infrastructure stack.

### 4. Infrastructure should support product delivery, not drive it

Do not let infrastructure ambition reshape the product roadmap.

---

## Documentation Enforcement Rules

### 1. Architecture docs are not optional commentary

If implementation introduces a material architecture change, the docs should be updated.

### 2. Conflicts must be resolved explicitly

If code, plans, or assumptions conflict with:

- [System Overview](../architecture/system-overview.md)
- [First Sellable Product](../product/first-sellable-product.md)
- [Lead Lifecycle](../workflows/lead-lifecycle.md)

then stop and document the conflict before building through it.

### 3. Prefer documented consistency over local optimization

Do not “just make it work” in a way that silently undermines shared architecture patterns.

---

## Success Condition

This document is working if future Cursor sessions consistently produce architecture that:

- keeps the platform cohesive
- keeps Postgres as operational truth
- keeps the API as the business boundary
- uses automations as orchestration, not ownership
- avoids duplicate systems
- avoids premature infrastructure or service complexity
