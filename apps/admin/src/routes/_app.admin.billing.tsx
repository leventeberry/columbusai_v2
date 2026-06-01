import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Coins } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";

export const Route = createFileRoute("/_app/admin/billing")({
  head: () => ({ meta: [{ title: "Billing — Columbus AI" }] }),
  component: () => (
    <RequireRole roles={["admin"]}>
      <ComingSoon title="Billing" subtitle="Plans, invoices, and revenue collection." icon={Coins} message="Stripe-powered billing coming soon." />
    </RequireRole>
  ),
});
