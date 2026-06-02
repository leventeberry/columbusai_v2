import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";

const tiers = [
  {
    name: "Launch",
    desc: "For businesses starting with a website and simple automation.",
    features: [
      "Website hosting",
      "Lead capture",
      "Basic analytics",
      "1–2 automations",
      "Monthly support",
    ],
    featured: false,
  },
  {
    name: "Growth",
    desc: "For businesses that need connected workflows and reporting.",
    features: [
      "Website management",
      "Workflow automation",
      "CRM / calendar / email integrations",
      "Client portal",
      "Monthly reports",
      "Support requests",
    ],
    featured: true,
  },
  {
    name: "Scale",
    desc: "For businesses needing custom AI, advanced automations, and managed operations.",
    features: [
      "Custom portals",
      "AI assistant workflows",
      "Multi-system integrations",
      "Advanced reporting",
      "Priority support",
      "Custom infrastructure",
    ],
    featured: false,
  },
];

export function PricingSection() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const goContact = () => {
    if (location.pathname === "/")
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    else navigate({ to: "/contact" });
  };
  return (
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Choose how much of the stack we run for you."
          description="Tiers scale with the surface area we manage. Talk to us for exact pricing."
          align="center"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-8 surface-1 transition-all ${
                t.featured
                  ? "border-strong shadow-glow lg:-translate-y-2"
                  : "border-subtle hover:border-strong"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-foreground">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground min-h-[3em]">{t.desc}</p>
              <div className="mt-6 text-3xl font-semibold tracking-tight">
                <span className="text-gradient">Request Pricing</span>
              </div>
              <Button
                onClick={goContact}
                className={`mt-6 w-full ${t.featured ? "bg-gradient-primary text-primary-foreground" : ""}`}
                variant={t.featured ? "default" : "outline"}
              >
                Request Pricing
              </Button>
              <ul className="mt-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-[color:var(--success)] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
