# Phase 7 — Functionality Alignment Audit

## Legacy code removed or quarantined

- **None.** No legacy code was removed or quarantined in apps/web. The columbus-ai folder remains a separate donor; it is not imported by apps/web. No duplicate API routes or superseded implementations exist inside apps/web to move to `_legacy/`.

## Dependencies removed

- **None.** No packages were removed. `react-hook-form` and `@hookform/resolvers` were added for the baseline Request Demo form.

## Runtime-critical routes (confirmed)

| Route / path | Status |
|--------------|--------|
| `/api/health` | Unchanged; working implementation. |
| `/api/chat` | Unchanged; OpenAI, Prisma, vector-db, Redis rate limit. |
| RAG ingest | `scripts/ingest.ts` and vector-db usage unchanged. |
| Redis rate limiting | `lib/rateLimit.ts` unchanged. |
| `/api/contact` | **Added.** Implemented with current stack: `lib/validations/contact.ts`, `lib/contact/appendLead.ts`, `lib/contact/sendLeadToN8n.ts`. Request/response shape matches `submitContact` and RequestDemoBtn (`ContactPayload`, `ContactResponse` with `ok`, `errors`). |

## Lint / typecheck fixes (no behavior change)

- **hooks/usePreventScroll.tsx**: Resolved ESLint/TypeScript issues (prefer-const, @ts-ignore → @ts-expect-error or type assertions, `any` → proper types) so lint and typecheck pass. Behavior unchanged.
- **lib/validations/request-demo.ts**: `optionalUrl` was unused; now used for `website` field so the variable is used and lint passes.

## Final verification commands that passed

- `npm run lint` (from `apps/web`) — exit 0
- `npm run typecheck` (from `apps/web`) — exit 0
- `npm run build` (from `apps/web`) — exit 0; routes built: `/`, `/terms`, `/privacy`, `/unsubscribe/[token]`, `/api/health`, `/api/chat`, `/api/contact`, `/api/messages`, `/api/metrics-lite`, `/dev/messages`

Smoke (run with dev server and prod compose as needed):

- `curl http://localhost:3000/api/health`
- `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}],"conversationId":null}'`
- Optional: `curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"fname":"Test","lname":"User","email":"test@example.com","phone":"5551234567","company":"Acme","what_automate":"Testing"}'`
