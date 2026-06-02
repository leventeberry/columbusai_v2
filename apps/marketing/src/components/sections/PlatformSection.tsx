import { Globe, Workflow, Plug, LayoutDashboard, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const layers = [
  {
    icon: Globe,
    title: "Website Layer",
    desc: "Fast hosted websites, lead capture pages, booking flows, and conversion-focused updates.",
  },
  {
    icon: Workflow,
    title: "Automation Layer",
    desc: "Automations for leads, reminders, reviews, follow-ups, internal tasks, and CRM updates.",
  },
  {
    icon: Plug,
    title: "Integration Layer",
    desc: "Connect tools like Google Calendar, Gmail, Stripe, HubSpot, GoHighLevel, Twilio, Slack, and SendGrid.",
  },
  {
    icon: LayoutDashboard,
    title: "Client Portal Layer",
    desc: "Clients can view results, leads, reports, requests, billing, documents, and business impact.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Operations Layer",
    desc: "Columbus AI manages services, deployments, automations, health, requests, and support from an internal ops console.",
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="One system for your website, automations, clients, and operations."
          description="Columbus AI is a fully managed stack — the layers below run together so nothing falls through the cracks."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {layers.map((l, i) => (
            <div
              key={l.title}
              className={`group relative rounded-2xl border border-subtle surface-1 p-6 hover:border-strong transition-all hover:-translate-y-0.5 ${
                i === 0 ? "lg:row-span-2" : ""
              } ${i === 4 ? "lg:col-span-2" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg surface-3 border border-subtle flex items-center justify-center">
                  <l.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{l.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
              {i === 0 && (
                <div className="mt-6 rounded-lg border border-subtle surface-2 p-3 font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
                    yoursite.com — 200 OK · 84ms
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
