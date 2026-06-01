import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Columbus AI" },
      { name: "description", content: "Launch, Growth, and Scale tiers. Talk to us for exact pricing tailored to your stack." },
      { property: "og:title", content: "Pricing — Columbus AI" },
      { property: "og:description", content: "Tiers scale with the surface area we manage for you." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: () => (
    <SiteLayout>
      <PricingSection />
      <FAQSection />
    </SiteLayout>
  ),
});