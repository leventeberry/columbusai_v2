import { createFileRoute, redirect } from "@tanstack/react-router";
import { WorkItemDetail } from "@/components/work/WorkItemDetail";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import { canChangeStatus, canSeeInternalNotes, getRole, isAgency } from "@/lib/portal-auth";

export const Route = createFileRoute("/_authenticated/admin/work/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Admin` }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!isAgency(getRole())) {
      throw redirect({ to: "/requests" });
    }
  },
  component: AdminWorkDetailPage,
});

function AdminWorkDetailPage() {
  const { id } = Route.useParams();
  const { currentUserId } = usePortalWorkspace();
  const role = getRole();

  return (
    <WorkItemDetail
      id={id}
      backHref="/admin/work"
      currentUserId={currentUserId}
      canSeeInternal={canSeeInternalNotes(role)}
      canEdit={canChangeStatus(role)}
    />
  );
}
