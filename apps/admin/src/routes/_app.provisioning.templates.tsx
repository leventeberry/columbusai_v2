import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/platform/confirm-dialog";
import { Copy, Pencil, Plus, Power } from "lucide-react";
import * as api from "@/lib/platform-api";

export const Route = createFileRoute("/_app/provisioning/templates")({
  head: () => ({ meta: [{ title: "Stack Templates — Columbus AI" }] }),
  component: TemplatesPage,
});

async function run<T extends api.PlatformActionResult>(p: Promise<T>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

function TemplatesPage() {
  api.usePlatformVersion();
  const templates = api.getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Stack templates"
          subtitle="Reusable infrastructure blueprints. Provision a client stack in one click."
        />
        <Button
          size="sm"
          onClick={() =>
            run(api.createStackTemplate({ name: `Custom Stack ${Date.now() % 1000}` }))
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create template
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">{t.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
              <Badge
                variant="outline"
                className={t.enabled ? "border-emerald-500/40 text-emerald-300" : ""}
              >
                {t.enabled ? "Active" : "Disabled"}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Services
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.services.map((s) => (
                  <Badge key={s} variant="outline" className="font-mono text-[10px] uppercase">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run(
                    api.updateStackTemplate({
                      templateId: t.id,
                      patch: { description: `${t.description} (edited)` },
                    }),
                  )
                }
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.cloneStackTemplate({ templateId: t.id }))}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Clone
              </Button>
              <ConfirmDialog
                title={t.enabled ? `Disable template "${t.name}"?` : `Enable template "${t.name}"?`}
                description={
                  t.enabled
                    ? "New provisioning jobs cannot use this template until re-enabled."
                    : "Template will become available for new provisioning jobs."
                }
                confirmLabel={t.enabled ? "Disable" : "Enable"}
                variant={t.enabled ? "danger" : "default"}
                onConfirm={() => run(api.disableStackTemplate({ templateId: t.id }))}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className={t.enabled ? "text-rose-400 hover:text-rose-300" : ""}
                  >
                    <Power className="mr-1.5 h-3.5 w-3.5" /> {t.enabled ? "Disable" : "Enable"}
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
