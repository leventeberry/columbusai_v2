import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/clients/projects")({
  head: () => ({ meta: [{ title: "Projects — Columbus AI" }] }),
  component: () => (
    <ComingSoon
      title="Projects"
      subtitle="Every active client engagement, end to end."
      icon={Briefcase}
      message="Project workspace is on deck."
    />
  ),
});
