import { useSyncExternalStore } from "react";
import { getPortalMe, type PortalMeResponse } from "@/lib/portal-session";

function subscribe(cb: () => void) {
  window.addEventListener("portal-session-changed", cb);
  window.addEventListener("portal-role-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("portal-session-changed", cb);
    window.removeEventListener("portal-role-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePortalMe(): PortalMeResponse | null {
  return useSyncExternalStore(subscribe, getPortalMe, () => null);
}

export function usePortalWorkspace() {
  const me = usePortalMe();
  const activeClientId = me?.portal.activeClientId ?? null;
  const currentUserId = me?.user.id ?? "";
  const clients = me?.portal.clients ?? [];
  const isAgency = me?.portal.isAgency ?? false;

  return {
    me,
    activeClientId,
    currentUserId,
    clients,
    isAgency,
  };
}
