import { Link } from "@tanstack/react-router";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  WORK_KANBAN_STATUSES,
  workStatusLabel,
  type WorkItem,
  type WorkStatus,
} from "@/data/entities";
import { changeStatus } from "@/data/services/work-center";
import { get as getUser } from "@/data/repositories/users";
import { formatRelative } from "@/data/utils";
import { WorkPriorityChip } from "./WorkPriorityChip";
import { WorkTypeBadge } from "./WorkTypeBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  items: WorkItem[];
  detailBase: "/requests" | "/admin/work";
  /** When set, cards can be dragged between columns and changeStatus is called with this actor id. */
  actorId?: string;
};

export function WorkKanban({ items, detailBase, actorId }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const dragEnabled = !!actorId;

  const onDragEnd = (e: DragEndEvent) => {
    if (!actorId || !e.over) return;
    const id = String(e.active.id);
    const target = String(e.over.id) as WorkStatus;
    if (!WORK_KANBAN_STATUSES.includes(target)) return;
    changeStatus(id, target, actorId);
  };

  const inner = (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {WORK_KANBAN_STATUSES.map((status) => (
        <Column
          key={status}
          status={status}
          items={items.filter((w) => w.status === status)}
          detailBase={detailBase}
          dragEnabled={dragEnabled}
        />
      ))}
    </div>
  );

  if (!dragEnabled) return inner;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {inner}
    </DndContext>
  );
}

function Column({
  status,
  items,
  detailBase,
  dragEnabled,
}: {
  status: WorkStatus;
  items: WorkItem[];
  detailBase: "/requests" | "/admin/work";
  dragEnabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !dragEnabled });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-[280px] shrink-0 rounded-xl border bg-surface/40 p-3 transition",
        isOver
          ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/5"
          : "border-border",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {workStatusLabel[status]}
        </p>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((w) => (
          <Card key={w.id} item={w} detailBase={detailBase} dragEnabled={dragEnabled} />
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground/60">
            {dragEnabled ? "Drop here" : "Empty"}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  item,
  detailBase,
  dragEnabled,
}: {
  item: WorkItem;
  detailBase: "/requests" | "/admin/work";
  dragEnabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: !dragEnabled,
  });
  const assignee = getUser(item.primaryAssigneeId);
  const href = detailBase === "/requests" ? `/requests/${item.id}` : `/admin/work/${item.id}`;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border border-border bg-background p-3 transition",
        dragEnabled && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-1 ring-[color:var(--accent)]/40",
      )}
    >
      <Link
        to={href}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        className="block hover:bg-surface-elevated/60 -m-0.5 p-0.5 rounded"
      >
        <p className="text-sm font-medium leading-tight line-clamp-2">{item.title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{item.id}</p>
        <div className="mt-3 flex items-center gap-1.5">
          <WorkTypeBadge type={item.type} />
          <WorkPriorityChip priority={item.priority} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          {assignee ? (
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px] bg-surface-elevated">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">Unassigned</span>
          )}
          <span className="text-[10px] text-muted-foreground">{formatRelative(item.updatedAt)}</span>
        </div>
      </Link>
    </div>
  );
}
