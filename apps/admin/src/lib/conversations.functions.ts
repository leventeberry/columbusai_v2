import { createServerFn } from "@tanstack/react-start";
import { assertAdminRole, requireApiSession } from "@/lib/auth-middleware";
import { apiFetch } from "@/lib/api.server";

export type AdminConversation = {
  id: string;
  agent: string;
  channel: string;
  preview: string;
  messageCount: number;
  sentiment: "positive" | "neutral" | "negative";
  updatedAt: string;
  createdAt: string;
};

export const fetchAdminConversations = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    return apiFetch<{ conversations: AdminConversation[]; totalToday: number }>(
      "/api/admin/conversations",
    );
  });
