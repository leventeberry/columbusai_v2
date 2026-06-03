import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConvertOpportunity, useStackTemplates } from "@/hooks/use-sales";
import type { ConvertClientResult } from "@/lib/sales-types";

type Props = {
  opportunityId: string;
  company: string;
  onConverted?: (result: ConvertClientResult) => void;
  trigger?: ReactNode;
};

export function ConvertClientDialog({ opportunityId, company, onConverted, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("tpl-basic");
  const { data: templates = [] } = useStackTemplates();
  const convert = useConvertOpportunity();

  async function handleConvert() {
    try {
      const result = await convert.mutateAsync({
        id: opportunityId,
        stackTemplateId: templateId,
      });
      setOpen(false);
      toast.success(
        result.alreadyProvisioned
          ? "Client already provisioned"
          : "Client converted and portal provisioned",
      );
      if (result.tempPassword) {
        toast.message("Portal login created", {
          description: `Temporary password for ${result.client.email}: ${result.tempPassword}`,
          duration: 20_000,
        });
      }
      onConverted?.(result);
    } catch {
      toast.error("Failed to convert opportunity");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Convert to client</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to client</DialogTitle>
          <DialogDescription>
            Win {company} and provision their portal workspace, membership, and onboarding work
            item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="stack-template">Service stack</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger id="stack-template">
              <SelectValue placeholder="Select stack template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleConvert()} disabled={convert.isPending}>
            {convert.isPending ? "Provisioning…" : "Convert & provision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
