import { createFileRoute } from "@tanstack/react-router";
import { AgentControl } from "@/components/dashboard/agent-control";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/automation/agents")({
  head: () => ({ meta: [{ title: "AI Agents — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader
        title="AI Agent control center"
        subtitle="Manage, monitor, and configure every production AI agent."
        actions={
          <Button size="sm" className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground">
            <Plus className="mr-1 h-4 w-4" /> New agent
          </Button>
        }
      />
      <AgentControl />
    </div>
  ),
});
