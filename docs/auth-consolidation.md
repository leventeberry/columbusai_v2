# Auth & Data Consolidation

**Status:** Supabase is **frozen** — do not add tables, migrations, or features under `apps/admin/supabase/`.

## Current dependency map (pre-removal)

| Area | Was | Now |
|------|-----|-----|
| Admin login / session | Supabase `signInWithPassword` + localStorage JWT | `POST /api/auth/login` → HttpOnly `columbus_session` (set via admin server functions) |
| Admin profile / roles | `profiles`, `user_roles` in Supabase | `auth.users` in Postgres via `GET /api/auth/me` |
| Admin team CRUD | `admin.functions.ts` + Supabase Auth Admin | `GET/POST/PATCH/DELETE /api/admin/users` |
| Admin sales proxy | `X-Admin-Token` + Supabase gate | Session cookie forwarded to API; `requireAdminAccess` accepts session **or** legacy token |
| Portal login | `portal-auth.ts` localStorage demo | API sessions + `auth.client_users` |
| Portal work center | In-memory `apps/portal/src/data/mock/db.ts` | `portal.*` tables + `/api/portal/work-items` |

## Postgres schemas

- `auth` — `users`, `sessions`, `client_users`, `password_reset_tokens`, `audit_events`
- `portal` — `clients`, `work_items`, comments, attachments, activity, notifications
- `sales`, `chat`, `automation` — unchanged

## Environment

| Variable | Service | Purpose |
|----------|---------|---------|
| `SESSION_SECRET` | API | HMAC/session token hashing (min 32 chars) |
| `SESSION_COOKIE_NAME` | API | Default `columbus_session` |
| `COOKIE_DOMAIN` | API | Optional e.g. `.columbusai.tech` for cross-subdomain |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | DB seed | First `SUPER_ADMIN` (`admin@columbusai.com` by default) |
| `ADMIN_API_TOKEN` | API + scripts | Legacy service token (optional if using sessions) |

**Removed after migration:** `VITE_SUPABASE_*`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Role mapping

| Admin UI | `auth.users.role` |
|----------|-------------------|
| admin | `ADMIN` |
| member | `STAFF` |
| viewer | `VIEWER` |

| Portal UI | `auth.client_users.role` (agency users use `auth.users.role` = `STAFF`/`ADMIN`) |
|-----------|----------------------------------------------------------------------------------|
| owner / admin / viewer | `OWNER` / `ADMIN` / `VIEWER` |
| agency_admin / agency_member | User role `STAFF`; no client row or multi-client access |

## CORS

API `CORS_ORIGIN` must include admin (`3002`) and portal (`3001`) origins with `Access-Control-Allow-Credentials: true` for direct browser calls. Server functions proxy cookies for same-origin admin/portal apps.
