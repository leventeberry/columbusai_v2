
# Columbus AI Marketing Website — Build Plan

A dark-mode-first premium SaaS marketing site inspired by Vercel/Linear/Stripe, built on the existing TanStack Start template. Public marketing only — `/admin` and `/client` are placeholder routes.

## Design system (src/styles.css)

- Force dark-mode-first: set dark tokens on `:root` (skip the light theme toggle).
- Palette: near-black base (`oklch(0.14 0.02 270)`), elevated surfaces, soft border `oklch(1 0 0 / 8%)`.
- Accent gradient: indigo → violet → cyan for hero/CTAs/section accents. Expose as `--gradient-primary`, `--gradient-subtle`, `--shadow-glow`.
- Typography: Inter (body) + a tighter display treatment (tracking-tight, large weights) for headings. Mono accent for dashboard mockups (JetBrains Mono).
- Reusable tokens: `--surface-1/2/3`, `--border-subtle`, `--text-muted`, gradient text utility.
- Subtle grid/dot background pattern utility for hero and section dividers.

## Routes (src/routes/)

- `index.tsx` — full marketing page composed of section components
- `platform.tsx`, `services.tsx`, `workflows.tsx`, `pricing.tsx`, `faq.tsx`, `contact.tsx` — each renders the relevant section(s) with its own `head()` meta (unique title/description/og)
- `client.tsx` — placeholder "Client Portal coming soon" page
- `admin.tsx` — placeholder "Admin Portal — authorized users only" page
- `privacy.tsx`, `terms.tsx` — basic legal placeholders
- Update `__root.tsx` meta (Columbus AI title/description/og) and ensure `<Outlet />` remains

Nav items link to dedicated routes; on home page the same sections also appear in sequence so single-page scroll works. "Request Demo" scrolls to `#contact` on home or navigates to `/contact`.

## Section components (src/components/sections/)

1. `Navbar` — sticky, blurred, gradient logo mark, nav links with active state, Client Login / Admin Login / Request Demo buttons
2. `Hero` — headline, subheadline, dual CTAs, animated dashboard mockup card showing Business Impact / Active Automations / Website Status / Leads Captured / Client Requests / Workflow Health as mini stat tiles with sparklines and status pills
3. `TrustStrip` — tagline + 6 badge pills
4. `PlatformSection` — 5 layer cards (Website / Automation / Integration / Client Portal / Admin Ops) in a bento-style grid
5. `ServicesSection` — 6 service cards with icon + title + description
6. `WorkflowsSection` — 8 workflow cards each showing Trigger → Action → Outcome with arrow visual
7. `PortalAccessSection` — two large side-by-side cards (Client / Admin); Admin card has lock icon and "Authorized users only" treatment
8. `ClientPortalPreview` — mock UI showing Business Impact / Month In Review / Active Requests / Recent Activity / Service Catalog
9. `AdminPlatformPreview` — mock UI: Active Clients / Stack Health / Work Center / Deployments / Logs / Automations / Integrations
10. `AIWidgetPlaceholder` — disabled chat-input card with "Coming soon" badge; isolated component for easy future swap
11. `PricingSection` — 3 tiers (Launch / Growth / Scale), no prices, "Request Pricing" CTA
12. `FAQSection` — shadcn Accordion with all 10 questions
13. `ContactSection` — form with all specified fields (Name, Company, Email, Phone, Website, What to automate, Current tools, Preferred contact method), email + response-time note. Form submit shows toast (no backend wired)
14. `Footer` — three columns (Platform / Access / Legal) + copyright

All sections use semantic tokens only — no raw color classes.

## Motion

- Light framer-motion: fade/slide on section enter via `whileInView`, subtle hover lift on cards, gradient shimmer on hero CTA. Restrained — not on every element.

## Out of scope (placeholders only)

- No backend wiring for the contact form (toast confirmation only)
- No real auth on `/client` or `/admin` — static placeholder pages
- AI widget is a visual placeholder component, swappable later
- No payments, no Lovable Cloud enablement

## Technical notes

- Pure frontend; no new packages beyond what's installed (framer-motion if not present — will add via `bun add` during build)
- Each route file sets its own `head()` meta per `tanstack-route-architecture`
- All section components live in `src/components/sections/` and are composed on `index.tsx` so individual routes can reuse them
