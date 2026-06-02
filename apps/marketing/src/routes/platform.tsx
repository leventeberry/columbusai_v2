import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { ClientPortalPreview } from "@/components/sections/ClientPortalPreview";
import { AdminPlatformPreview } from "@/components/sections/AdminPlatformPreview";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform — Columbus AI" },
      {
        name: "description",
        content:
          "One managed system for your website, automations, integrations, client portals, and admin operations.",
      },
      { property: "og:title", content: "Platform — Columbus AI" },
      {
        property: "og:description",
        content:
          "The managed Columbus AI stack — website, automation, integration, portal, and admin layers.",
      },
      { property: "og:url", content: "/platform" },
    ],
    links: [{ rel: "canonical", href: "/platform" }],
  }),
  component: () => (
    <SiteLayout>
      <PlatformSection />
      <ClientPortalPreview />
      <AdminPlatformPreview />
    </SiteLayout>
  ),
});
