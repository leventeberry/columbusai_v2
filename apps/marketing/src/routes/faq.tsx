import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { FAQSection } from "@/components/sections/FAQSection";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Columbus AI" },
      { name: "description", content: "Answers about what Columbus AI builds, how setup works, portal access, integrations, and support." },
      { property: "og:title", content: "FAQ — Columbus AI" },
      { property: "og:description", content: "Questions, answered." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: () => (
    <SiteLayout>
      <FAQSection />
    </SiteLayout>
  ),
});