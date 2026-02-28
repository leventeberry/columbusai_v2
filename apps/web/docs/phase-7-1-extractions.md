# Phase 7.1: Extractions (No UI Change)

Extracted reusable layout primitives, block components, and shared utilities from the existing UI codebase. No visual or behavioral changes; DOM and classNames preserved.

## Extracted components and utilities

| Item | Location | Purpose |
|------|----------|--------|
| **Container** | `components/layout/Container.tsx` | Inner width wrapper: `mx-auto` + `max-w-*` (5xl, 6xl, 3xl, 2xl, xl), with variants `footer` and `header` for exact Footer/Header layout. Optional `className` merged. |
| **Section** | `components/layout/Section.tsx` | Semantic wrapper: `<section>` or `<article>` with pass-through `className`, `id`, `aria-labelledby`. No default padding. |
| **TitleDescCard** | `components/blocks/TitleDescCard.tsx` | Card + CardHeader + CardTitle (text-lg) + CardContent; props `title`, `children`. Same markup as ExampleWorkflowsSection items. |
| **SectionCard** | `components/blocks/SectionCard.tsx` | Card + CardHeader + CardTitle (text-2xl) + CardContent (space-y-6); props `title`, `id?`, `children`. Same markup as WhoAndWhatSection cards. |
| **parseJsonOrThrow** | `lib/errors.ts` | Parse `Response` body as JSON or throw with same error messages as former dev/messages implementation. |

## Before / after duplication (rough)

- **Layout inner divs:** ~12+ repeated `mx-auto max-w-*` (and footer/header) wrappers → single `Container` with `maxWidth` / `variant` and optional `className`.
- **Section/article wrappers:** 9+ repeated `<section>` / `<article>` with various classNames → `Section` with pass-through props.
- **Card compositions:** 8 repeated Card+CardHeader+CardTitle+CardContent blocks (6 in ExampleWorkflowsSection, 2 in WhoAndWhatSection) → `TitleDescCard` (6 uses), `SectionCard` (2 uses).
- **API error parsing:** 1 inline `parseJsonOrThrow` in dev/messages → shared `lib/errors.parseJsonOrThrow` (dev/messages only; ChatBot unchanged to avoid behavior change).

## No UI change

- **Container:** Renders the same combined class strings as before (e.g. `mx-auto max-w-5xl`, footer/header variants). Call sites that passed extra classes use `className` and get identical output.
- **Section:** Renders the same tag and attributes; `className` is passed through unchanged.
- **TitleDescCard / SectionCard:** Markup and classes match the original Card usage (CardTitle `text-lg` vs `text-2xl`, CardContent `space-y-6` where used).
- **parseJsonOrThrow:** Implementation is the same; only the call site (dev/messages) was updated to import from `lib/errors`.

## Changed files

**New**

- `apps/web/components/layout/Container.tsx`
- `apps/web/components/layout/Section.tsx`
- `apps/web/components/blocks/TitleDescCard.tsx`
- `apps/web/components/blocks/SectionCard.tsx`
- `apps/web/lib/errors.ts`

**Modified**

- `apps/web/components/sections/WhatWeDoSection.tsx`
- `apps/web/components/sections/WhoAndWhatSection.tsx`
- `apps/web/components/sections/ExampleWorkflowsSection.tsx`
- `apps/web/components/sections/HowItWorksSection.tsx`
- `apps/web/components/sections/FaqSection.tsx`
- `apps/web/components/sections/FeatureSection.tsx`
- `apps/web/components/sections/CtaSection.tsx`
- `apps/web/components/Footer.tsx`
- `apps/web/components/Header.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/app/terms/page.tsx`
- `apps/web/app/unsubscribe/[token]/page.tsx`
- `apps/web/app/dev/messages/page.tsx`

## Verification commands that passed

- `npm run lint` (from `apps/web`; pre-existing ChatBot warnings only)
- `npm run typecheck` (from `apps/web`)
- `npm run build` (from `apps/web`)

Manual verification: run dev and confirm home, privacy, terms, unsubscribe, dev/messages, header, and footer render as before.

Prod smoke (run from repo root if using docker):

- `docker compose -f infra/docker/compose.prod.yml up --build -d`
- `curl <base>/api/health`
- `curl -X POST <base>/api/chat` (with required body as needed)
