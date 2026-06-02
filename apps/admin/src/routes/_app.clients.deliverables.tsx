import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { CheckSquare } from "lucide-react";

export const Route = createFileRoute("/_app/clients/deliverables")({
  head: () => ({ meta: [{ title: "Deliverables — Columbus AI" }] }),
  component: () => (
    <ComingSoon
      title="Deliverables"
      subtitle="Track every shippable across active engagements."
      icon={CheckSquare}
      message="Deliverables tracker is launching soon."
    />
  ),
});
