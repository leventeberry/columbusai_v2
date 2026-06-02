import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSalesPipeline, useUpdatePipelineStage } from "@/hooks/use-sales";
import type { LeadStage, PipelineLeadCard } from "@/lib/sales-types";
import { pipelineCardToLeadCard } from "@/lib/sales-types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS: { id: LeadStage; title: string; accent: string }[] = [
  { id: "new", title: "New", accent: "bg-info/40" },
  { id: "qualified", title: "Qualified", accent: "bg-chart-2/40" },
  { id: "proposal", title: "Proposal Sent", accent: "bg-primary/40" },
  { id: "negotiation", title: "Negotiation", accent: "bg-warning/40" },
  { id: "won", title: "Won", accent: "bg-success/40" },
  { id: "lost", title: "Lost", accent: "bg-destructive/40" },
];

function LeadCard({ lead, dragging }: { lead: PipelineLeadCard; dragging?: boolean }) {
  const scoreTone =
    lead.score >= 85 ? "text-success" : lead.score >= 70 ? "text-warning" : "text-muted-foreground";
  const detailTo =
    lead.entityType === "opportunity"
      ? "/sales/opportunities/$opportunityId"
      : "/sales/leads/$leadId";
  const detailParams =
    lead.entityType === "opportunity"
      ? { opportunityId: lead.id }
      : { leadId: lead.id };

  return (
    <Link
      to={detailTo}
      params={detailParams}
      className={cn(
        "block rounded-lg border border-border/60 bg-card/80 p-3 text-sm shadow-card transition-colors hover:border-primary/40",
        dragging && "rotate-1 ring-1 ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium leading-tight">{lead.company}</div>
        <span className={cn("font-mono text-xs", scoreTone)}>{lead.score}</span>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{lead.contact}</div>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="border-border/60 bg-background/40 text-[10px] font-normal">
          {lead.service.length > 28 ? `${lead.service.slice(0, 28)}…` : lead.service}
        </Badge>
        <span className="font-mono text-xs text-foreground/90">
          ${(lead.value / 1000).toFixed(0)}k
        </span>
      </div>
    </Link>
  );
}

function DraggableLead({ lead }: { lead: PipelineLeadCard }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <LeadCard lead={lead} />
    </div>
  );
}

function Column({
  col,
  leads,
}: {
  col: (typeof COLUMNS)[number];
  leads: PipelineLeadCard[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const total = leads.reduce((s, l) => s + l.value, 0);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border/60 bg-card/40 transition-colors",
        isOver && "border-primary/50 bg-primary/[0.04]",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", col.accent)} />
        <span className="text-sm font-medium">{col.title}</span>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          ${(total / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {leads.map((l) => (
          <DraggableLead key={`${l.entityType}-${l.id}`} lead={l} />
        ))}
        {leads.length === 0 && (
          <div className="grid h-16 place-items-center rounded-md border border-dashed border-border/50 text-xs text-muted-foreground">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

export function LeadPipeline() {
  const { data: cards, isLoading, isError } = useSalesPipeline();
  const updateStage = useUpdatePipelineStage();
  const items = useMemo(
    () => (cards ?? []).map(pipelineCardToLeadCard),
    [cards],
  );
  const [active, setActive] = useState<PipelineLeadCard | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragStart(e: DragStartEvent) {
    setActive(items.find((i) => i.id === e.active.id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null);
    const over = e.over?.id as LeadStage | undefined;
    if (!over) return;
    const card = items.find((i) => i.id === e.active.id);
    if (!card || card.stage === over) return;
    updateStage.mutate({
      id: card.id,
      pipelineStage: over,
      entityType: card.entityType,
    });
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1">
        {COLUMNS.map((c) => (
          <Skeleton key={c.id} className="h-64 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load pipeline. Check API connectivity and ADMIN_API_TOKEN.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {COLUMNS.map((c) => (
          <Column key={c.id} col={c} leads={items.filter((l) => l.stage === c.id)} />
        ))}
      </div>
      <DragOverlay>{active ? <LeadCard lead={active} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
