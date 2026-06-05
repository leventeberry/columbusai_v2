import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({
    meta: [{ title: "Documents — Columbus AI" }],
  }),
  component: () => (
    <ComingSoon
      title="Documents"
      subtitle="Contracts, proposals, and client deliverables."
      icon={FileText}
      message="Document library launching after Sprint 1 dashboard MVP."
    />
  ),
});
