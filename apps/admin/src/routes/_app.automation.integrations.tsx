import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Plug } from "lucide-react";

export const Route = createFileRoute("/_app/automation/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Columbus AI" }] }),
  component: () => <ComingSoon title="Integrations" subtitle="Connect Columbus to the tools your clients live in." icon={Plug} message="Integration marketplace is being built." />,
});
