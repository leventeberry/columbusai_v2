const badges = [
  "Workflow Automation",
  "Website Hosting",
  "Client Portals",
  "AI Assistants",
  "Integrations",
  "Reporting",
];

export function TrustStrip() {
  return (
    <section className="border-y border-subtle surface-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          Built for businesses that rely on repeatable operations, fast response times, and connected systems.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="px-3 py-1.5 text-xs text-muted-foreground border border-subtle rounded-full surface-2"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}