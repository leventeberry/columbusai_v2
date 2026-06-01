import { createFileRoute } from "@tanstack/react-router";
import { WorkflowMonitoring } from "@/components/dashboard/workflow-monitoring";
import { PageHeader } from "@/components/dashboard/page-header";

export const Route = createFileRoute("/_app/automation/workflows")({
  head: () => ({ meta: [{ title: "Workflows — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader title="Workflows" subtitle="Real-time execution status of every automation." />
      <WorkflowMonitoring />
    </div>
  ),
});
