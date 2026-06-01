import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { documents, type DocItem } from "@/lib/mock/portal";
import { Button } from "@/components/ui/button";
import { Download, FileText, Upload, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — Columbus AI" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const grouped = useMemo(() => {
    const g: Record<string, DocItem[]> = {};
    for (const d of documents) {
      (g[d.group] = g[d.group] || []).push(d);
    }
    return g;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Reports, invoices, contracts, and shared files with Columbus AI."
        actions={<UploadDialog />}
      />

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => (
          <section key={group}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</h2>
            <div className="surface-card divide-y divide-border">
              {items.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.size} · uploaded {d.uploaded}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success("Review request sent")}
                      className="text-muted-foreground hidden sm:inline-flex"
                    >
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Request review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(`Downloading ${d.name}`)}
                    >
                      <Download className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function UploadDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>Share a file with the Columbus AI team.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input id="file" type="file" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success("Document uploaded")}>Upload</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
