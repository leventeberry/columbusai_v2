import { MessageSquare, Sparkles } from "lucide-react";

/**
 * Placeholder for the existing Columbus AI chat widget.
 * Swap the rendered card with the real widget mount later — keep the wrapping
 * <section> and id so deep links and surrounding layout don't change.
 */
export function AIWidgetPlaceholder() {
  return (
    <section id="ai-widget" className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-strong surface-1 overflow-hidden">
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-glow)" }} />
          <div className="relative p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Ask about automations, workflows, portals, or integrations.</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-subtle surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Coming soon
              </span>
            </div>
            <div className="mt-6 rounded-xl border border-subtle surface-2 p-4">
              <input
                disabled
                placeholder="Ask the Columbus AI assistant…"
                className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              The Columbus AI chat widget will be integrated here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}