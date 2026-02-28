# Phase 7 — UI Baseline Lock Report

## Baseline files copied or updated

| Category | Path | Action |
|----------|------|--------|
| Layout / app | `app/layout.tsx` | Kept as-is (no Stripe script) |
| | `app/globals.css` | Aligned with donor: `:root` var order (`--background`, `--foreground` first); comment removed |
| | `app/page.tsx` | Replaced with full section composition (HeroSection → CtaSection) |
| Pages | `app/terms/page.tsx` | Added from columbus-ai |
| | `app/privacy/page.tsx` | Added from columbus-ai |
| | `app/unsubscribe/[token]/page.tsx` | Added from columbus-ai |
| Layout components | `components/Header.tsx` | Already matched donor |
| | `components/Footer.tsx` | Already matched donor |
| | `components/Logo.tsx` | Already matched donor |
| Request demo | `components/RequestDemoBtn.tsx` | Replaced stub with full form + dialog; uses shadcn Select for dropdowns |
| Sections | `components/sections/HeroSection.tsx` | Already matched donor |
| | `components/sections/WhatWeDoSection.tsx` | Already present |
| | `components/sections/WhoAndWhatSection.tsx` | Already present |
| | `components/sections/ExampleWorkflowsSection.tsx` | Already present |
| | `components/sections/HowItWorksSection.tsx` | Already present |
| | `components/sections/FaqSection.tsx` | Already present |
| | `components/sections/CtaSection.tsx` | Already present |
| UI primitives | `components/ui/select.tsx` | Added from columbus-ai |
| | `components/ui/separator.tsx` | Added from columbus-ai |
| | `components/ui/sheet.tsx` | Added from columbus-ai |
| | button, card, dialog, input, label | Unchanged |
| Types | `types/contact.ts` | Added from columbus-ai |
| Shared | `lib/constants.ts`, `lib/utils.ts` | Already matched donor |

## Router

- **App Router in both** (columbus-ai and apps/web). No router port; no adaptation.

## Primitive swaps (shadcn-only)

- **RequestDemoBtn**: Donor used native `<select>` for team size, timeline, and budget. Replaced with shadcn `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) from `@/components/ui/select`, wired via `Controller` from react-hook-form. Labels, options (BUDGET_OPTIONS, TEAM_SIZE_OPTIONS, TIMELINE_OPTIONS), spacing, and styling preserved; no visual change.
- **No other non-shadcn primitives** found; no further swaps.

## Dependencies added for baseline UI

- `react-hook-form@^7.71.1` — form state and validation (donor dependency).
- `@hookform/resolvers@^5.2.2` — Zod resolver for react-hook-form (donor dependency).

## Assets

- Hero background: `public/hero-bg.jpg` is referenced in `HeroSection` and existing `app/page.tsx`. If the file is missing in `apps/web/public/`, add it or document for deploy; no layout change.
