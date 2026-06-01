import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { CheckSquare } from "lucide-react";

export const Route = createFileRoute("/_app/operations/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Columbus AI" }] }),
  component: () => <ComingSoon title="Tasks" subtitle="Operator task queue and SLAs." icon={CheckSquare} message="Task queue launching soon." />,
});
