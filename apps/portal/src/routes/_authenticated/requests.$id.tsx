import { createFileRoute } from "@tanstack/react-router";
import { WorkItemDetail } from "@/components/work/WorkItemDetail";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import { canSeeInternalNotes, canChangeStatus } from "@/lib/portal-auth";
import { getRole } from "@/lib/portal-auth";

export const Route = createFileRoute("/_authenticated/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Columbus AI` }] }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = Route.useParams();
  const { currentUserId } = usePortalWorkspace();
  const role = getRole();

  return (
    <WorkItemDetail
      id={id}
      backHref="/requests"
      currentUserId={currentUserId}
      canSeeInternal={canSeeInternalNotes(role)}
      canEdit={canChangeStatus(role)}
    />
  );
}
