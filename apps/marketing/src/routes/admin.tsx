import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Columbus AI" },
      { name: "description", content: "Restricted admin console for Columbus AI operators." },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "/admin" },
    ],
  }),
  component: AdminPlaceholder,
});

function AdminPlaceholder() {
  return (
    <SiteLayout>
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-24">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-xl text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl surface-3 border border-strong flex items-center justify-center">
            <Lock className="h-7 w-7 text-foreground" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Admin Portal</h1>
          <p className="mt-3 text-muted-foreground">
            Restricted to Columbus AI operators. Authentication will be wired in from the
            separate admin application — this is a placeholder access point.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button variant="outline" className="border-strong" disabled>
              Sign in (coming soon)
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Back home</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}