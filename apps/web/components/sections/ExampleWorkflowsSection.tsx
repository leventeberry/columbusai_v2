import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { TitleDescCard } from "@/components/blocks/TitleDescCard";

const WORKFLOWS = [
  {
    title: "New Lead → Instant Response + Routing",
    desc: "When a lead comes in, send an immediate reply and route to the right person by type or territory.",
  },
  {
    title: "Missed Call → Text Back + Booking",
    desc: "Detect missed calls and send a follow-up text with a booking link to reduce no-shows.",
  },
  {
    title: "Invoice Paid → Onboarding Sequence",
    desc: "Trigger a welcome sequence and internal checklist when payment is received.",
  },
  {
    title: "Job Completed → Review Request",
    desc: "After job completion, automatically request a review and log it in your CRM.",
  },
  {
    title: "New Ticket → Categorize + Assign + SLA reminders",
    desc: "New support tickets get categorized, assigned, and SLA reminders keep the team on track.",
  },
  {
    title: "Daily Ops Summary → Email/Slack",
    desc: "Each morning, get a summary of pipeline, tasks due, and key metrics in email or Slack.",
  },
] as const;

export default function ExampleWorkflowsSection() {
  return (
    <Section
      id="workflows"
      className="scroll-mt-20 bg-muted px-4 py-12 md:py-16"
      ariaLabelledby="workflows-title"
    >
      <Container>
        <h2
          id="workflows-title"
          className="mb-2 mt-6 text-2xl font-semibold text-foreground"
        >
          Example workflows
        </h2>
        <ul className="my-4 grid gap-4">
          {WORKFLOWS.map((w) => (
            <li key={w.title}>
              <TitleDescCard title={w.title}>
                <p className="mb-0 text-muted-foreground">{w.desc}</p>
              </TitleDescCard>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
