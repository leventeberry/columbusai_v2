import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { apiFetch } from "@/lib/api.server";
import { assertAdminRole, requireApiSession } from "@/lib/auth-middleware";

const APP_ROLES = ["admin", "member", "viewer"] as const;

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await apiFetch<{ users: unknown[] }>("/api/admin/users");
    return data.users;
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        display_name: z.string().min(1).max(120),
        password: z.string().min(8).max(72),
        role: z.enum(APP_ROLES),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    return apiFetch<{ id: string }>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(APP_ROLES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    await apiFetch(`/api/admin/users/${data.user_id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: data.role }),
    });
    return { ok: true };
  });

export const removeUser = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    if (data.user_id === context.userId) throw new Error("You cannot remove yourself.");
    await apiFetch(`/api/admin/users/${data.user_id}`, { method: "DELETE" });
    return { ok: true };
  });
