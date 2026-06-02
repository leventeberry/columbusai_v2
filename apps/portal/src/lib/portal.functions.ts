import { createServerFn } from "@tanstack/react-start";
import { apiFetch } from "@/lib/api.server";
import { requireApiSession } from "@/lib/auth-middleware";
import type { WorkItem } from "@/data/entities";

export const fetchPortalWorkItems = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async () => {
    const res = await apiFetch<{ workItems: WorkItem[] }>("/api/portal/work-items");
    return res.workItems;
  });
