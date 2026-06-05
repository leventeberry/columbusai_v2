# Columbus AI Project Rules

**Status:** Cursor constitution  
**Last updated:** June 2026  
**Primary reference:** [First Sellable Product](../product/first-sellable-product.md)

---

## Purpose

This document is the highest-level guidance for future Cursor sessions working on Columbus AI.

It defines what the project is, who it serves, what matters most, and which principles must govern product, architecture, and implementation decisions.

When a session is unsure what to prioritize, this document should win.

---

## Core Project Identity

Columbus AI is a **Client Operations System**.

It is not primarily:

- a generic CRM
- a reporting dashboard
- an AI chatbot product
- a marketplace
- an enterprise workflow platform

It is a system that helps small service businesses:

- capture leads
- automate follow-up
- convert prospects into clients
- onboard clients
- manage ongoing client relationships
- reduce administrative work

The project exists to create operational clarity and better business outcomes for owners who do not have time, staff, or infrastructure for complex software.

---

## Primary Customer

The primary customer is a **small service business**, typically with **1–25 employees**.

Common examples include:

- estheticians and med spas
- recovery housing operators
- consultants and coaches
- agencies
- home service businesses
- professional services

These customers typically need:

- fewer missed leads
- faster follow-up
- clearer client status
- easier onboarding
- centralized documents and communication
- less admin overhead

All project decisions should be evaluated against this customer profile.

---

## Primary Outcome Areas

Every meaningful feature should support one or more of these outcomes:

1. **Acquire clients**
2. **Onboard clients**
3. **Serve clients**
4. **Retain clients**

If a proposed feature does not clearly help one of those areas, it should be questioned before implementation.

---

## Core Project Rules

### 1. Avoid feature creep

Do not add capabilities just because they sound useful in the abstract.

Before building, ask:

- Does this support the first sellable product?
- Does this make the core workflow more effective?
- Does this improve operational visibility or reduce manual work?

If not, defer it.

### 2. Business outcomes matter more than technical sophistication

The project should optimize for:

- more conversions
- less admin work
- better onboarding
- clearer visibility
- better client experience

It should not optimize for novelty, architectural complexity, or feature breadth without business justification.

### 3. Do not introduce enterprise complexity into MVP

Avoid introducing:

- multi-tenant enterprise abstractions
- advanced team hierarchy models
- white-label platforms
- highly configurable workflow builders
- enterprise-grade permission systems beyond MVP need

The first sellable product is for small service businesses, not enterprise IT departments.

### 4. Prefer workflows over isolated features

Features should be understood as part of end-to-end workflows:

- lead capture
- follow-up
- qualification
- conversion
- onboarding
- active client management
- retention

Do not build isolated UI or backend features that are disconnected from these workflows.

### 5. Prefer visibility over automation magic

Automation is valuable only when the operator can still understand:

- what happened
- what is happening next
- what failed
- what requires human attention

Avoid “magic” systems that automate hidden behavior without clear operational visibility.

### 6. Prefer clarity over configurability

Use sensible defaults and documented workflows before exposing customization.

Do not add knobs, toggles, builders, or branching logic unless the standard flow has been validated by real use.

### 7. Keep the MVP narrow and sellable

The current objective is not to build the full future platform.

The objective is to build a sellable product that reliably helps a small service business:

- capture leads
- follow up consistently
- onboard clients
- manage operational work

If a feature delays that outcome, it likely does not belong in current priority.

---

## Operational Design Rules

### 1. Every important screen should support action

Screens should not merely describe state. They should help the user decide what to do next.

### 2. Urgency should be visible

Overdue follow-ups, blocked onboarding, failed automations, and missing documents should be easy to identify.

### 3. Owners should not need to remember workflow state from memory

The system should hold and surface:

- next actions
- due dates
- statuses
- blockers
- context

### 4. Context should travel with the record

Lead, client, task, document, and message context should stay connected rather than being fragmented across tools.

### 5. Client-facing experiences must remain simple

Clients should not need training to understand:

- what happened
- what to do next
- where to upload information
- what is waiting on them

---

## MVP Boundaries

The following are explicitly **not** launch requirements and should not reshape the project without documented justification:

- marketplace functionality
- billing systems
- advanced AI agents
- custom workflow builders
- multi-tenant enterprise features
- white-label support
- complex team hierarchy management
- native mobile apps
- advanced BI/reporting platforms

These may be future opportunities, but they are not current default priorities.

---

## Decision Filter For Future Sessions

When deciding whether to build something, future sessions should ask:

1. Does this help acquire, onboard, serve, or retain?
2. Does this reduce manual work?
3. Does this increase operational visibility?
4. Does this fit the small service business customer?
5. Does this keep the MVP clearer and more sellable?

If the answer is mostly no, the work should be deferred, questioned, or rejected.

---

## Rule Hierarchy

For future Cursor work, rule precedence should be:

1. [First Sellable Product](../product/first-sellable-product.md)
2. This document (`project-rules.md`)
3. [Product Rules](./product-rules.md)
4. [Architecture Rules](./architecture-rules.md)
5. [Implementation Rules](./implementation-rules.md)
6. Supporting product, workflow, and architecture docs

If a proposed implementation conflicts with the first sellable product definition, stop and resolve the conflict before continuing.

---

## Success Condition

This document is working if future development sessions consistently:

- stay focused on the same customer
- reinforce the same core workflows
- avoid drifting into unrelated software categories
- prioritize outcomes over features
- build the same product instead of reinventing Columbus AI each session
