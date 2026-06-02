import { Globe, Workflow, LayoutDashboard, MessageSquare, Plug, BarChart3 } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const services = [
  {
    icon: Globe,
    title: "Website Hosting & Management",
    desc: "We host and maintain your website with performance, uptime, SSL, updates, and lead capture in mind.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    desc: "We automate repetitive tasks across your tools so leads, reminders, updates, and handoffs happen consistently.",
  },
  {
    icon: LayoutDashboard,
    title: "Client Portals",
    desc: "We create portals where your customers or internal teams can view activity, submit requests, access documents, and track progress.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat & Assistant Widgets",
    desc: "We integrate AI-powered chat widgets and assistant experiences into your site or workflows, including the Columbus AI assistant on this site.",
  },
  {
    icon: Plug,
    title: "Integrations",
    desc: "We connect your business tools so information flows automatically instead of being copied manually.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Business Impact",
    desc: "Dashboards and reports that show leads captured, tasks automated, hours saved, and revenue influenced.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need, managed end-to-end."
          description="Pick the pieces you need or run the whole stack with us."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-subtle surface-1 p-6 hover:border-strong transition-all"
            >
              <div className="h-10 w-10 rounded-lg surface-3 flex items-center justify-center group-hover:bg-gradient-primary transition-colors">
                <s.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
