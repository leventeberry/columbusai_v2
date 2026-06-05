# Security hardening pass

Summary of the security-first hardening implemented across API auth, portal data exposure, RBAC, rate limiting, session handling, production compose, and CI.

## Security changes summary

### 1. Chat and messages (`/api/chat`, `/api/messages`)

- Conversations bind to **widget** (HMAC token) or **authenticated user** (`owner_user_id`, `principal_type`).
- Clients send `X-Conversation-Token` (or `Authorization: Bearer`) after bootstrap; mismatched UUID/token/session returns **403**.
- New conversations without auth receive `{ conversationId, conversationToken }`.
- Rate limits: presets `chat` and `messages` (IP + optional conversation suffix).

### 2. Portal work items

- Internal comments and `comment_added` activity hidden from non-agency roles in GET work item payloads.
- **VIEWER** agency role blocked from portal mutations (create work item, patch, comment).

### 3. Client provisioning

- Agency emails (`STAFF`, `ADMIN`, `SUPER_ADMIN`) no longer demoted to `CLIENT`.
- Returns **409** `AGENCY_EMAIL_CONFLICT` with audit event on conflict.

### 4. Admin RBAC

- `requireAdminReadAccess`: SUPER_ADMIN, ADMIN, STAFF, VIEWER (+ legacy `X-Admin-Token`).
- `requireAdminWriteAccess`: SUPER_ADMIN, ADMIN, STAFF only (+ legacy token).
- GET sales routes use read; mutating routes use write.

### 5. Rate limiting

- Production default **fail_closed** when Redis unavailable (503) instead of unlimited traffic.
- Presets: `login`, `leadsDemo`, `chat`, `messages`, `adminToken`.
- Structured `rate_limit_degraded` logs.

### 6. Login session cookie

- `sessionToken` removed from login JSON; cookie-only via `Set-Cookie`.
- Portal/admin server functions parse `Set-Cookie` from API login response.

### 7. Production compose

- Required env: `POSTGRES_PASSWORD`, `N8N_BASIC_AUTH_*`, `ADMIN_API_TOKEN`, `WIDGET_SESSION_SECRET`, `OPENAI_API_KEY` on API.
- n8n: `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`; expression env vars opt-in only.

### 8. CI

- `pnpm build` in GitHub Actions workflow.
- API `test` script via `node --test`.

## Tests added

| File | Proves |
|------|--------|
| `apps/api/src/lib/chat/widgetToken.test.ts` | HMAC sign/verify, mismatch, tamper |
| `apps/api/src/routes/chat.security.test.ts` | Cross-conversation token rejection |
| `apps/api/src/lib/rateLimit.test.ts` | fail_closed / fail_open without Redis |
| `apps/api/src/lib/portal/serialize.test.ts` | Internal comment/activity filtering |
| `apps/api/src/lib/onboarding/provisionClient.test.ts` | Agency email guard logic |
| `apps/api/src/middleware/adminAccess.test.ts` | VIEWER read-only vs STAFF write |
| `apps/api/src/routes/auth/login.test.ts` | No `sessionToken` in body; rate limit wired |

## Remaining risks

- Legacy `ADMIN_API_TOKEN` still grants **write** access (documented exception for n8n/automation).
- Portal dashboard and several pages still use mock data.
- n8n expression env access can be re-enabled via `N8N_EXPRESSIONS_ALLOWED_ENV_VARS` (avoid in production unless required).
- Chat/message integration tests against a live DB are not in CI (unit tests only).

## Deployment readiness

| Step | Action |
|------|--------|
| Migration | Run `pnpm db:migrate:deploy` (adds `owner_user_id`, `principal_type` on `chat.conversations`) |
| Env | Set `WIDGET_SESSION_SECRET` (≥32 chars), confirm `REDIS_URL`, `COOKIE_DOMAIN` for subdomains |
| Compose | Update `.env.production` with newly required vars before `compose.prod.yml` up |
| Redeploy | API + marketing (widget token header) + portal/admin (login cookie parse) |
| Smoke | Widget chat bootstrap → token in sessionStorage; portal login; VIEWER cannot PATCH leads |

Production go-live is **not ready** until migration, env vars, redeploy, and smoke tests pass.
