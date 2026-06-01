## Goal

Refactor the Work Center from direct mock-store access into a layered data architecture (entities → repositories → services → hooks) so swapping in Supabase later is a single-layer change, and add global Search + Command Palette that consume the new layer.

No UI redesign. No backend yet. Mock data continues to back everything, but components stop importing from `src/lib/mock/*` directly.

---

## New folder structure

```text
src/
  data/
    entities/         pure TS types + enums (no logic, no React)
      work-item.ts
      work-comment.ts
      work-attachment.ts
      work-activity.ts
      notification.ts
      user.ts
      client.ts
    mock/             mock "database" tables (moved from src/lib/mock)
      db.ts           in-memory tables + pub/sub + seed
      seed.ts
    repositories/     row-level CRUD; only layer that touches db.ts
      work-items.ts
      comments.ts
      attachments.ts
      activity.ts
      notifications.ts
      clients.ts
      users.ts
    services/         business workflows; orchestrate repos + emit activity/notifications
      work-center.ts
      notifications.ts
      search.ts
  hooks/
    useWorkItems.ts        (rewritten to call repositories via subscribe)
    useWorkItem.ts
    useNotifications.ts
    useActivityFeed.ts
    useGlobalSearch.ts
  components/
    search/
      GlobalSearch.tsx     ⌘K command palette
      SearchResults.tsx
```

`src/lib/mock/workItems.ts` becomes a thin re-export shim during migration, then is deleted in the final step.

---

## Entities

One file per entity in `src/data/entities/`. Pure types + enums, no functions. Mirror the future Supabase schema:

- `WorkItem` — id, title, description, type, status, priority, clientId, createdBy, primaryAssigneeId, assigneeIds, watcherIds, tags, archivedAt, createdAt, updatedAt, dueDate
- `WorkComment` — id, workItemId, authorId, body, visibility, mentions, parentId, createdAt, editedAt
- `WorkAttachment` — id, workItemId, uploaderId, name, size, mime, url, createdAt
- `WorkActivity` — id, workItemId, actorId, kind, from, to, createdAt
- `Notification` — id, recipientId, workItemId, activityId, kind, title, body, readAt, createdAt
- `User`, `ClientUser`, `Client`

Adds vs. today: `archivedAt` on work items, `Notification` row (currently derived ad-hoc in `NotificationsPopover`).

---

## Repository layer

Each repo exposes row-level operations + `subscribe(cb)` returning unsubscribe. Components MUST NOT import `db.ts`; only repositories do.

```text
work-items.ts     list(filter), get(id), insert, update, softDelete, subscribe
comments.ts       listFor(workItemId, includeInternal), insert, update, subscribe
attachments.ts    listFor(workItemId), insert, remove, subscribe
activity.ts       listFor(workItemId), listFeed(filter), insert, subscribe
notifications.ts  listFor(userId), insert, markRead, markAllRead, unreadCount, subscribe
clients.ts        list, get, subscribe
users.ts          list, get, listByClient
```

Repositories are dumb: validate args, read/write rows, emit. No cross-entity logic.

---

## Service layer

Services orchestrate repositories and own all side-effects (activity + notifications). Components and hooks call services for mutations, repositories for reads.

`services/work-center.ts`:

- `createWorkItem(input, actor)` → insert item + `created` activity + notify watchers/agency
- `updateWorkItem(id, patch, actor)` → diff fields, emit per-field activity (`priority_changed`, `title_changed`, etc.)
- `changeStatus(id, status, actor)` → status activity, `completed` activity when done, notify watchers + client
- `assignWorkItem(id, userId, actor)` → assignee activity, notify new assignee
- `addComment({ workItemId, body, visibility, mentions }, actor)` → comment activity, notify mentions + watchers (filter internal for clients)
- `uploadAttachment(input, actor)` → attachment activity, notify watchers
- `addWatcher(id, userId, actor)` / `removeWatcher`
- `archiveWorkItem(id, actor)` → set `archivedAt`, activity

`services/notifications.ts`:

- `createNotification(input)`, `markRead(id, userId)`, `markAllRead(userId)`, `getUnreadCount(userId)`
- Internal `notify(recipients, payload)` helper used by work-center

`services/search.ts`:

- `search(query, { actor })` → returns grouped `{ workItems, clients, comments, attachments }` results, scoped by role (clients only see their own; agency sees all)

---

## Hooks (subscription-ready)

All use `useSyncExternalStore` against repository `subscribe`. Shape:

```ts
useWorkItems(filter?)     // list, reactive
useWorkItem(id)           // single + comments + attachments + activity (composed)
useNotifications(userId)  // list + unreadCount
useActivityFeed(filter?)  // cross-item feed for dashboard
useGlobalSearch(query)    // debounced, calls services/search
```

Hooks expose `{ data, loading, error }` even though mock is sync, so the Supabase swap doesn't change call sites.

---

## Activity events

Every service mutation emits exactly one activity per logical change. Service layer is the only place that writes activity — repositories never do. Kinds: `created`, `status_changed`, `priority_changed`, `assignee_changed`, `watcher_added`, `comment_added`, `attachment_added`, `attachment_removed`, `archived`, `completed`.

---

## Notifications

Replace ad-hoc derivation in `NotificationsPopover.tsx` with `useNotifications(currentUserId)`. The service emits `Notification` rows whenever activity is created, applying recipient rules:

- comment → mentions + watchers + assignee (skip author)
- status change / assignment / completion → watchers + client owner / assignee
- internal-visibility comment → agency users only

Deep-link rule stays role-aware (client → `/requests/$id`, agency → `/admin/work/$id`).

---

## Global Search + Command Palette

New `components/search/GlobalSearch.tsx` built on existing `cmdk` (already in `components/ui/command.tsx`). Triggered by ⌘K / Ctrl+K and by the search input in `TopBar`.

Result groups (via `services/search.ts`):

- Work Items (id, title, status pill)
- Clients
- Comments (snippet + parent work item)
- Attachments (filename + parent work item)

Actions group (always shown, filtered by role):

- Create Work Item → opens `NewWorkItemDialog`
- Assign Work… → picks item then user (`assignWorkItem`)
- Change Status… → picks item then status (`changeStatus`)
- Add Comment… → picks item, inline body field (`addComment`)
- Open Client → navigates
- Open Request / Work Item → navigates

Wire ⌘K listener in `__root.tsx` (or `_authenticated.tsx`) and a button in `TopBar`.

---

## Migration steps (in order)

1. Create `src/data/entities/*` types (copy/clean from `mock/workItems.ts`).
2. Move mock tables + pub/sub to `src/data/mock/db.ts`; keep seed data identical.
3. Build repositories; each owns its table slice.
4. Build services on top of repositories; centralize activity + notification emission.
5. Rewrite `src/hooks/useWorkItems.ts` and add new hooks against repos/services.
6. Switch all components/routes to import from hooks/services (codemod the ~30 files listed). No behavior change expected.
7. Replace `NotificationsPopover` derivation with `useNotifications`.
8. Add `GlobalSearch` command palette; wire ⌘K + TopBar search.
9. Delete `src/lib/mock/workItems.ts` shim once nothing imports it.

Each step keeps the app green; step 6 is the largest diff but mechanical.

---

## Out of scope

- Real Supabase wiring, RLS, migrations
- Auth changes (still uses `portal-auth.ts` mock viewer)
- UI redesign of existing pages
- File upload to real storage (attachments stay mock URLs)
- `src/lib/mock/portal.ts` (legacy dashboard mocks) — left alone; only `workItems` mock is migrated
