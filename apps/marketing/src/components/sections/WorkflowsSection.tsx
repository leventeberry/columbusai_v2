import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const workflows = [
  { trigger: "New Lead", action: "Instant Response + CRM Routing", outcome: "Cut response time from hours to seconds." },
  { trigger: "Missed Call", action: "Text Back + Booking Link", outcome: "Recover revenue from missed connections." },
  { trigger: "Appointment Scheduled", action: "Reminder Sequence", outcome: "Fewer no-shows, fuller calendars." },
  { trigger: "Job Completed", action: "Review Request", outcome: "Compound social proof on autopilot." },
  { trigger: "Invoice Paid", action: "Onboarding Workflow", outcome: "New customers start without manual handoff." },
  { trigger: "Support Request", action: "Categorize + Assign", outcome: "Right team, right ticket, every time." },
  { trigger: "Daily Ops", action: "Summary to Email or Slack", outcome: "One scan a day keeps surprises away." },
  { trigger: "Website Form", action: "Portal Request + Notification", outcome: "Inbound work tracked from the first click." },
];

export function WorkflowsSection() {
  return (
    <section id="workflows" className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Workflows"
          title="Examples of what Columbus AI can automate"
          description="A trigger fires, the system acts, and the outcome compounds."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflows.map((w) => (
            <div key={w.trigger} className="rounded-2xl border border-subtle surface-1 p-5 hover:border-strong transition-colors">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Trigger</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{w.trigger}</div>
              <ArrowRight className="my-3 h-4 w-4 text-[color:var(--brand-violet)]" />
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Action</div>
              <div className="mt-1 text-sm font-medium text-foreground">{w.action}</div>
              <div className="mt-4 pt-4 border-t border-subtle text-xs text-muted-foreground italic">
                {w.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}