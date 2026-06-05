import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LeadDetailPanel } from "@/components/dashboard/lead-detail-panel";

type Props = {
  leadId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadDetailSheet({ leadId, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Lead details</SheetTitle>
          <SheetDescription>Review status, follow-up, and next actions.</SheetDescription>
        </SheetHeader>
        <div className="mt-6">{leadId ? <LeadDetailPanel leadId={leadId} /> : null}</div>
      </SheetContent>
    </Sheet>
  );
}
