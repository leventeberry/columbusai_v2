import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { UsersRound } from "lucide-react";

export const Route = createFileRoute("/_app/operations/team")({
  head: () => ({ meta: [{ title: "Team — Columbus AI" }] }),
  component: () => (
    <ComingSoon
      title="Team"
      subtitle="Your operators, roles, and on-call rotations."
      icon={UsersRound}
      message="Team management is on the roadmap."
    />
  ),
});
