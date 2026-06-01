import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { dbSubscribe } from "@/data/mock/db";
import * as activityRepo from "@/data/repositories/activity";
import * as attachmentsRepo from "@/data/repositories/attachments";
import * as commentsRepo from "@/data/repositories/comments";
import * as notificationsRepo from "@/data/repositories/notifications";
import * as workItemsRepo from "@/data/repositories/work-items";
import type { WorkItemFilter } from "@/data/repositories/work-items";
import { search, type SearchActor, type SearchResults } from "@/data/services/search";

// The mock DB is sync, but every hook is shaped as if a real subscription
// could replace `dbSubscribe` later (Supabase Realtime channel, etc.).
function useStoreVersion() {
  return useSyncExternalStore(
    (cb) => dbSubscribe(cb),
    () => _version,
    () => _version,
  );
}

// `useSyncExternalStore` requires a stable snapshot value. The repo's array
// identity changes on mutation (because dbMutate replaces tables), so we just
// track a numeric version that bumps on every store change.
let _version = 0;
dbSubscribe(() => {
  _version++;
});

export function useWorkItems(filter: WorkItemFilter = {}) {
  useStoreVersion();
  return workItemsRepo.list(filter);
}

export function useWorkItem(id: string) {
  useStoreVersion();
  return workItemsRepo.get(id);
}

export function useComments(workItemId: string, includeInternal: boolean) {
  useStoreVersion();
  return commentsRepo.listFor(workItemId, includeInternal);
}

export function useAttachments(workItemId: string) {
  useStoreVersion();
  return attachmentsRepo.listFor(workItemId);
}

export function useActivity(workItemId: string) {
  useStoreVersion();
  return activityRepo.listFor(workItemId);
}

export function useActivityFeed(limit = 50) {
  useStoreVersion();
  return activityRepo.listFeed(limit);
}

export function useNotifications(userId: string | null | undefined) {
  useStoreVersion();
  if (!userId) return { notifications: [], unreadCount: 0 } as const;
  return {
    notifications: notificationsRepo.listFor(userId),
    unreadCount: notificationsRepo.unreadCount(userId),
  } as const;
}

/** Debounced global search. */
export function useGlobalSearch(query: string, actor: SearchActor): SearchResults {
  useStoreVersion();
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);
  return search(debounced, actor);
}

// Stable filter helper for components that want a memoized filter object
export function useFilter<T>(value: T, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => value, deps)();
}
