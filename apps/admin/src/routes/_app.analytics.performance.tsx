import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { WorkflowMonitoring } from "@/components/dashboard/workflow-monitoring";

export const Route = createFileRoute("/_app/analytics/performance")({
  head: () => ({ meta: [{ title: "Automation Performance — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader
        title="Automation performance"
        subtitle="Success rates, runtimes, and throughput per workflow."
      />
      <WorkflowMonitoring />
    </div>
  ),
});
