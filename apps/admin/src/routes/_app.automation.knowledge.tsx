import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_app/automation/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge Base — Columbus AI" }] }),
  component: () => (
    <ComingSoon
      title="Knowledge base"
      subtitle="The single source of truth your agents draw from."
      icon={BookOpen}
      message="Knowledge ingestion pipeline coming soon."
    />
  ),
});
