import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AIWidgetPlaceholder } from "@/components/sections/AIWidgetPlaceholder";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Columbus AI" },
      { name: "description", content: "Website hosting, workflow automation, client portals, AI assistants, integrations, and reporting." },
      { property: "og:title", content: "Services — Columbus AI" },
      { property: "og:description", content: "Pick the pieces or run the whole stack with us." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: () => (
    <SiteLayout>
      <ServicesSection />
      <AIWidgetPlaceholder />
    </SiteLayout>
  ),
});