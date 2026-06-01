import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Settings } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";

export const Route = createFileRoute("/_app/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Columbus AI" }] }),
  component: () => (
    <RequireRole roles={["admin"]}>
      <ComingSoon title="Settings" subtitle="Workspace, security, and branding configuration." icon={Settings} message="Settings panel is being polished." />
    </RequireRole>
  ),
});
