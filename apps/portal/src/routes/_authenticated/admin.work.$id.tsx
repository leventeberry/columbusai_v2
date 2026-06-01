import { createFileRoute, redirect } from "@tanstack/react-router";
import { WorkItemDetail } from "@/components/work/WorkItemDetail";
import { CURRENT_AGENCY_USER_ID } from "@/data/mock/db";
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
  const role = typeof window !== "undefined" ? getRole() : "agency_admin";
  return (
    <WorkItemDetail
      id={id}
      backHref="/admin/work"
      currentUserId={CURRENT_AGENCY_USER_ID}
      canSeeInternal={canSeeInternalNotes(role)}
      canEdit={canChangeStatus(role)}
    />
  );
}
