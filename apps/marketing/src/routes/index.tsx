import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WorkflowsSection } from "@/components/sections/WorkflowsSection";
import { PortalAccessSection } from "@/components/sections/PortalAccessSection";
import { ClientPortalPreview } from "@/components/sections/ClientPortalPreview";
import { AdminPlatformPreview } from "@/components/sections/AdminPlatformPreview";
import { AIWidgetPlaceholder } from "@/components/sections/AIWidgetPlaceholder";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactSection } from "@/components/sections/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Columbus AI — Automate the busywork. Operate with clarity." },
      { name: "description", content: "Columbus AI builds and manages automations, websites, client portals, and integrations so businesses respond faster and scale without chaos." },
      { property: "og:title", content: "Columbus AI — Managed AI Operations Platform" },
      { property: "og:description", content: "Automations, websites, portals, and integrations — managed end-to-end." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <TrustStrip />
      <PlatformSection />
      <ServicesSection />
      <WorkflowsSection />
      <PortalAccessSection />
      <ClientPortalPreview />
      <AdminPlatformPreview />
      <AIWidgetPlaceholder />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </SiteLayout>
  );
}
