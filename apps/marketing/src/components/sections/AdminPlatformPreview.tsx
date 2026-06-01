import { SectionHeading } from "./SectionHeading";

export function AdminPlatformPreview() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Admin Platform"
          title="The console behind every client experience."
          description="Behind every client experience is an operations console that helps Columbus AI monitor, maintain, and improve the systems we manage."
        />

        <div className="mt-14 rounded-2xl border border-strong surface-1 shadow-elevated overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-subtle surface-2">
            <div className="flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />)}</div>
            <div className="flex-1 text-center text-xs text-muted-foreground font-mono">columbusai.tech/admin</div>
          </div>
          <div className="grid lg:grid-cols-4 gap-4 p-6">
            {[
              { l: "Active Clients", v: "47", s: "3 onboarding" },
              { l: "Stack Health", v: "99.98%", s: "all green" },
              { l: "Work Center", v: "23 open", s: "8 in progress" },
              { l: "Deployments", v: "12 today", s: "all passing" },
            ].map((t) => (
              <div key={t.l} className="rounded-xl border border-subtle surface-2 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{t.l}</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{t.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.s}</div>
              </div>
            ))}

            <div className="lg:col-span-2 rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Logs · Last 5 min</div>
              <div className="font-mono text-xs space-y-1 text-muted-foreground">
                <div><span className="text-[color:var(--success)]">[OK]</span> automation.lead_route → routed in 412ms</div>
                <div><span className="text-[color:var(--success)]">[OK]</span> deploy.client_acme → v1.42.3 healthy</div>
                <div><span className="text-[color:var(--warning)]">[WARN]</span> integration.hubspot → retry 1/3</div>
                <div><span className="text-[color:var(--success)]">[OK]</span> integration.hubspot → recovered</div>
                <div><span className="text-[color:var(--success)]">[OK]</span> report.weekly → delivered (12 clients)</div>
              </div>
            </div>
            <div className="rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Automations</div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Lead → CRM</span><span className="text-[color:var(--success)] text-xs">live</span></li>
                <li className="flex justify-between"><span>Missed call → SMS</span><span className="text-[color:var(--success)] text-xs">live</span></li>
                <li className="flex justify-between"><span>Review request</span><span className="text-[color:var(--success)] text-xs">live</span></li>
                <li className="flex justify-between"><span>Onboarding flow</span><span className="text-[color:var(--warning)] text-xs">draft</span></li>
              </ul>
            </div>
            <div className="rounded-xl border border-subtle surface-2 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Integrations</div>
              <div className="flex flex-wrap gap-2">
                {["Google", "Gmail", "Stripe", "HubSpot", "GoHighLevel", "Twilio", "Slack", "SendGrid"].map((i) => (
                  <span key={i} className="px-2.5 py-1 text-xs rounded-md border border-subtle surface-3">{i}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}