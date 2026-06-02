import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

export function PortalAccessSection() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Portal Access"
          title="Already a Columbus AI client?"
          description="Jump straight into your client portal to track work, leads, and performance."
        />
        <div className="mt-12 grid gap-6">
          <div className="relative mx-auto w-full max-w-2xl rounded-2xl border border-subtle surface-1 p-8 overflow-hidden">
            <div
              className="absolute -top-20 -right-20 h-60 w-60 rounded-full"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Client Portal</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                For Columbus AI clients. Use this to:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "View website performance",
                  "Track leads and automations",
                  "Submit requests",
                  "View reports",
                  "Manage billing",
                  "Access documents",
                ].map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[color:var(--brand-cyan)]">→</span>
                    {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground">
                <Link to="/client">
                  Open Client Portal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
