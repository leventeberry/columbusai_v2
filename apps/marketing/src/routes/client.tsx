import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Client Portal — Columbus AI" },
      {
        name: "description",
        content:
          "Access your Columbus AI client portal to view performance, requests, reports, billing, and documents.",
      },
      { property: "og:title", content: "Client Portal — Columbus AI" },
      { property: "og:description", content: "Sign in to your Columbus AI client portal." },
      { property: "og:url", content: "/client" },
    ],
    links: [{ rel: "canonical", href: "/client" }],
  }),
  component: ClientPlaceholder,
});

function ClientPlaceholder() {
  return (
    <SiteLayout>
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-24">
        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative max-w-xl text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Client Portal</h1>
          <p className="mt-3 text-muted-foreground">
            The Columbus AI client portal is launching soon. Active clients will receive sign-in
            credentials at onboarding. In the meantime, reach out and we'll get you set up.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild className="bg-gradient-primary text-primary-foreground">
              <Link to="/contact">
                Request access <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-strong">
              <Link to="/">Back home</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
