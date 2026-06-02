import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { WorkflowsSection } from "@/components/sections/WorkflowsSection";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows — Columbus AI" },
      {
        name: "description",
        content:
          "Examples of automations Columbus AI runs: lead routing, missed-call text-back, reminders, reviews, onboarding, and more.",
      },
      { property: "og:title", content: "Workflows — Columbus AI" },
      {
        property: "og:description",
        content: "A trigger fires, the system acts, and the outcome compounds.",
      },
      { property: "og:url", content: "/workflows" },
    ],
    links: [{ rel: "canonical", href: "/workflows" }],
  }),
  component: () => (
    <SiteLayout>
      <WorkflowsSection />
    </SiteLayout>
  ),
});
