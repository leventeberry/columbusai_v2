import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Columbus AI" },
      {
        name: "description",
        content: "Terms of service for the Columbus AI platform and managed services.",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-4 text-muted-foreground">
          Placeholder terms of service. Full terms will be published before any new commercial
          agreement. For details in the meantime, email{" "}
          <a className="text-foreground underline" href="mailto:contact@columbusai.tech">
            contact@columbusai.tech
          </a>
          .
        </p>
      </section>
    </SiteLayout>
  ),
});
