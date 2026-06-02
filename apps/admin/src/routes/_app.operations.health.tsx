import { createFileRoute } from "@tanstack/react-router";
import { SystemHealth } from "@/components/dashboard/system-health";
import { PageHeader } from "@/components/dashboard/page-header";

export const Route = createFileRoute("/_app/operations/health")({
  head: () => ({ meta: [{ title: "System Health — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader
        title="System health"
        subtitle="Infrastructure and provider status across regions."
      />
      <SystemHealth />
    </div>
  ),
});
