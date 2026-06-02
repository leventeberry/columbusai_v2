import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Columbus AI" },
      { name: "description", content: "How Columbus AI collects, uses, and protects information." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          Columbus AI Automation Solutions LLC respects your privacy. This page is a placeholder —
          the full policy will live here. For questions, email{" "}
          <a className="text-foreground underline" href="mailto:contact@columbusai.tech">
            contact@columbusai.tech
          </a>
          .
        </p>
      </section>
    </SiteLayout>
  ),
});
