import { SectionHeading } from "./SectionHeading";

export function ClientPortalPreview() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client Portal"
          title="Visibility built for the people you serve."
          description="Your clients should never have to wonder what is happening behind the scenes. Columbus AI gives them visibility into the work, results, and requests that matter."
        />

        <div className="mt-14 rounded-2xl border border-strong surface-1 shadow-elevated overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-subtle surface-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              ))}
            </div>
            <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
              portal.client.com
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4 p-6">
            <div className="lg:col-span-2 rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Business Impact · This Month
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-foreground">$48,240</span>
                <span className="text-sm text-[color:var(--success)]">+18.4%</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Leads</div>
                  <div className="font-semibold">342</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Hours saved</div>
                  <div className="font-semibold">128</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Automations run</div>
                  <div className="font-semibold">4,217</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Month In Review
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Booked appointments</span>
                  <span className="font-medium">86</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Reviews captured</span>
                  <span className="font-medium">42</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Avg response</span>
                  <span className="font-medium">38s</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Active Requests
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-foreground">New landing page</span>
                  <span className="text-xs text-[color:var(--warning)]">In review</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-foreground">Add Slack alerts</span>
                  <span className="text-xs text-[color:var(--brand-cyan)]">In progress</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-foreground">Q3 report</span>
                  <span className="text-xs text-muted-foreground">Scheduled</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-2 rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Lead "Acme Co" routed to Sales</span>
                  <span className="text-muted-foreground text-xs">2m ago</span>
                </li>
                <li className="flex justify-between">
                  <span>Invoice #1042 paid · onboarding started</span>
                  <span className="text-muted-foreground text-xs">14m ago</span>
                </li>
                <li className="flex justify-between">
                  <span>Daily ops summary delivered</span>
                  <span className="text-muted-foreground text-xs">1h ago</span>
                </li>
                <li className="flex justify-between">
                  <span>Review request sent to 8 customers</span>
                  <span className="text-muted-foreground text-xs">3h ago</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-3 rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Service Catalog
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Website updates",
                  "New automation",
                  "Integration",
                  "Custom report",
                  "Portal access",
                  "AI assistant tuning",
                ].map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 text-xs rounded-full border border-subtle surface-3 text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
