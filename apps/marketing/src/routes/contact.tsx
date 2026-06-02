import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { ContactSection } from "@/components/sections/ContactSection";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Request a Demo — Columbus AI" },
      {
        name: "description",
        content:
          "Tell us what you want to automate. We'll show you how Columbus AI would run it. Response within 1 business day.",
      },
      { property: "og:title", content: "Request a Demo — Columbus AI" },
      { property: "og:description", content: "Ready to automate the busywork? Get in touch." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <SiteLayout>
      <ContactSection />
    </SiteLayout>
  ),
});
