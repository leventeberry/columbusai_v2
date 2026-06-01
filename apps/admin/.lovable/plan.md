# Columbus AI — Real Action Layer + Backend Readiness

Goal: keep mock data, but route every operational button through a typed async service layer that mirrors a real backend contract. No real Docker / Supabase Edge / Stripe / n8n wiring yet.

Also: quietly fix the current SSR runtime error `Briefcase is not defined` on `/admin/billing` (missing lucide-react import) as part of this pass.

---

## 1. Service layer

Create `src/lib/platform-api.ts` — the single entry point for all operational actions.

Shape:

```ts
export type PlatformActionResult = {
  success: boolean
  message: string
  jobId?: string
  deploymentId?: string
  serviceId?: string
  secretId?: string
  domainId?: string
  templateId?: string
  workspaceId?: string
  environmentId?: string
  error?: string
}
```

Helpers:
- `mockDelay(min=400, max=1200)` — randomized latency.
- `maybeFail(rate=0)` — opt-in failure simulation (default off; provisioning + verify-domain use small rates).
- `newId(prefix)` — `prefix_<base36>`.

Exported functions (all typed input → `Promise<PlatformActionResult>`):

Provisioning / stacks
- `provisionClientStack({ clientId, templateId, workspaceId, environmentId })`
- `cancelProvisioningJob({ jobId })`
- `retryProvisioningJob({ jobId })`
- `createStackTemplate(input)` / `updateStackTemplate(input)` / `cloneStackTemplate({ templateId })` / `disableStackTemplate({ templateId })`

Workspaces / environments
- `createClientWorkspace({ clientId, name })`
- `createEnvironment({ workspaceId, kind })`
- `pauseStack({ environmentId })`
- `promotePreviewToProduction({ environmentId })`
- `runDatabaseBackup({ environmentId })`

Deployments / services
- `deployEnvironment({ environmentId })`
- `redeployEnvironment({ environmentId })`
- `rollbackDeployment({ deploymentId })`
- `restartService({ serviceId })`
- `openServiceLogs({ serviceId })` (returns `{ success, message, logsUrl }`)
- `rebuildWebsite({ environmentId })`

Domains / secrets / env vars
- `addDomain` / `verifyDomain` / `renewSsl` / `manageRedirects`
- `createSecret` / `rotateSecret` / `revokeSecret`
- `addEnvVar` / `deleteEnvVar`

Integrations / automations / billing / usage
- `connectIntegration({ providerId })` / `openIntegrationDetails({ integrationId })`
- `openN8n({ environmentId })` / `inspectWorkflow({ workflowId })`
- `upgradePlan({ clientId, plan })` / `viewInvoices({ clientId })`
- `recordUsageEvent(event)` (used internally by other actions)
- `saveSettings(payload)`

Each function:
1. `await mockDelay()`
2. Mutates `src/lib/mock/platform.ts` where appropriate (e.g. new job, new deployment, paused env).
3. Calls `recordTimelineEvent(...)` to append to the relevant timeline (see §4).
4. Returns a typed `PlatformActionResult`.

Designed so future swap = replace body with `fetch('/api/...')` while keeping the same input/output contract.

---

## 2. Mock state changes

Extend `src/lib/mock/platform.ts`:
- Add `timeline: TimelineEvent[]` per client + `provisioningTimeline: TimelineEvent[]` global.
- Add `appendTimeline(clientId, evt)` and `appendProvisioningTimeline(evt)`.
- Add `subscribe(listener)` pub/sub so UI re-renders on mutation (lightweight — `useSyncExternalStore` hook `usePlatformStore(selector)`).
- Provisioning queue tick logic stays; `cancel` flips status to `cancelled`; `retry` resets `progress=0`, `status='running'`; on `success` push a deployment record into the target environment.

---

## 3. Toast feedback

Use existing `sonner` toast. Pattern in every handler:

```ts
const res = await platformApi.redeployEnvironment({ environmentId })
res.success ? toast.success(res.message) : toast.error(res.error ?? res.message)
```

Standard messages match the spec ("Redeploy started for Production", "Restarting Redis", etc.).

---

## 4. Timeline events

Every successful action appends a `TimelineEvent` with `kind` (deployment | service | domain | secret | backup | stack | rollback), `severity`, `message`, `at`. Renders in:
- `HealthTimeline` (Client Detail → Overview)
- New `ProvisioningTimeline` on `/provisioning/queue`

---

## 5. Button wiring

Touch the following route/component files and replace inline stubs (or `onClick={() => {}}`) with handlers calling `platform-api`. All buttons get loading state via local `isPending` + disabled while running.

- `src/routes/_app.clients.$clientId.tsx` — Deploy / Redeploy / Open Logs / Restart / Promote / Backup / Pause; tab actions for Services, Website, Automations, Integrations, Deployments, Billing, Settings.
- `src/routes/_app.provisioning.queue.tsx` — Start / Cancel / Retry; failed-job error panel.
- `src/routes/_app.provisioning.templates.tsx` — Create / Clone / Edit / Disable.
- `src/routes/_app.provisioning.domains.tsx` — Add / Verify / Renew / Redirects.
- `src/routes/_app.provisioning.secrets.tsx` — Create / Rotate / Revoke.
- `src/routes/admin/billing` route (also fix `Briefcase` import).

---

## 6. Confirmation dialogs

New `src/components/platform/confirm-dialog.tsx` (wraps shadcn `AlertDialog`) with `title`, `description`, `impact` (bulleted list), `confirmLabel`, `variant: 'danger' | 'default'`.

Used by: Pause Stack, Rollback, Revoke Secret, Delete Env Var, Disable Template, Cancel Provisioning Job.

---

## 7. Empty states

New `src/components/platform/empty-state.tsx` — icon, title, description, primary CTA. Plug into: Domains, Secrets, Provisioning Queue, Deployments, Integrations, Usage Events, Automations.

---

## 8. Command palette

Extend existing palette (`src/components/dashboard/command-palette.tsx` or equivalent — confirm during build) with an "Actions" group:
- Redeploy current environment, Open logs, Restart Redis, Create client, Provision new stack, Add domain, Rotate secret, Open n8n, View usage.

Each item invokes the same `platform-api` function. Context (current `clientId` / `environmentId`) comes from route params via `useParams({ strict: false })`.

---

## 9. Out of scope

- No real network calls, no Supabase migrations, no edge functions.
- No visual redesign — reuse current tokens, components, dark control-plane look.
- No changes to auth, routing structure, or sidebar.

---

## Technical notes

- All new files use existing design tokens from `src/styles.css` — no raw colors.
- Types live alongside `platform-api.ts` (`PlatformActionResult`, input types) and are imported from route files for handler signatures.
- Store updates use `useSyncExternalStore` so timeline / queue / deployments re-render without prop drilling.
- Quiet fix: add missing `Briefcase` to the lucide-react import in the billing route that's currently throwing on SSR.
