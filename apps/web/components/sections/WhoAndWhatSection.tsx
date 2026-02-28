import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionCard } from "@/components/blocks/SectionCard";

const WHO_ITEMS = [
  {
    strong: "Leaders who are tired of patchwork systems.",
    p: "If your business runs on sticky notes, inbox flags, spreadsheets, and \"don't forget to…\" reminders, you're operating below your potential.",
  },
  {
    strong: "Companies juggling multiple tools that don't communicate.",
    p: "When your CRM, calendar, email platform, payment processor, and internal chat operate in isolation, inefficiency multiplies. We connect them into one coordinated workflow.",
  },
  {
    strong: "Teams experiencing growth friction.",
    p: "When volume increases but processes stay manual, things break. We design systems that scale with demand instead of collapsing under it.",
  },
  {
    strong: "Organizations that depend on repeatable processes.",
    p: "Whether you manage leads, onboard clients, schedule services, process requests, or handle recurring tasks — we turn those processes into structured, automated systems.",
  },
  {
    strong: "Decision-makers who want operations to run without constant supervision.",
    p: "If your business requires you to personally monitor every step to keep things moving, automation creates stability and accountability.",
  },
];

const WHAT_CHANGES_ITEMS = [
  {
    strong: "Manual tasks stop dominating your team's day.",
    p: "Processes that once required constant attention — routing leads, sending reminders, updating records, triggering next steps — begin running automatically in the background.",
  },
  {
    strong: "Information flows where it's supposed to.",
    p: "Instead of re-entering data across platforms, systems stay synchronized. Everyone works from accurate, up-to-date information.",
  },
  {
    strong: "Response times shrink dramatically.",
    p: "New inquiries are acknowledged instantly. Tasks are assigned automatically. Follow-ups happen without relying on memory.",
  },
  {
    strong: "Execution becomes consistent.",
    p: "Every client receives the same structured experience. Every request moves through the same defined path. No more variability based on who handled it.",
  },
  {
    strong: "Leadership gains visibility.",
    p: "Clear dashboards and reporting provide insight into workload, performance, and bottlenecks — without asking for updates.",
  },
  {
    strong: "Capacity increases without chaos.",
    p: "You handle more volume without proportional increases in stress, headcount, or administrative overhead.",
  },
];

export default function WhoAndWhatSection() {
  return (
    <Section className="bg-background px-4 pb-12 pt-10" ariaLabelledby="who-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <SectionCard title="Who This Is Built For" id="who-title">
            <ul className="list-none space-y-6 pl-0">
              {WHO_ITEMS.map((item) => (
                <li key={item.strong}>
                  <strong className="text-foreground">{item.strong}</strong>
                  <p className="mb-0 mt-1 text-foreground">{item.p}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-foreground">
              Our approach works across industries because nearly every company
              shares the same challenge: too many manual steps and not enough
              operational cohesion.
            </p>
          </SectionCard>
          <SectionCard title="What Changes After We Build Your Systems">
            <div className="space-y-6">
              {WHAT_CHANGES_ITEMS.map((item) => (
                <div key={item.strong}>
                  <p className="mb-1 font-bold text-foreground">{item.strong}</p>
                  <p className="mt-0 text-foreground">{item.p}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-foreground">
              <strong className="text-foreground">Automation isn&apos;t about replacing people.</strong> It&apos;s
              about removing friction so your business can operate at its
              intended level.
            </p>
          </SectionCard>
        </div>
      </Container>
    </Section>
  );
}
