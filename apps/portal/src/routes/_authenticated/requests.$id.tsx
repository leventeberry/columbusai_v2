import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkItemDetail } from "@/components/work/WorkItemDetail";
import { CURRENT_AGENCY_USER_ID, CURRENT_CLIENT_USER_ID } from "@/data/mock/db";
import { canSeeInternalNotes, canChangeStatus, getRole, isAgency } from "@/lib/portal-auth";
import type { Role } from "@/lib/mock/portal";

export const Route = createFileRoute("/_authenticated/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Columbus AI` }] }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = Route.useParams();
  const [role, setRole] = useState<Role>("owner");
  useEffect(() => {
    const sync = () => setRole(getRole());
    sync();
    window.addEventListener("portal-role-changed", sync);
    return () => window.removeEventListener("portal-role-changed", sync);
  }, []);
  const agency = isAgency(role);
  return (
    <WorkItemDetail
      id={id}
      backHref="/requests"
      currentUserId={agency ? CURRENT_AGENCY_USER_ID : CURRENT_CLIENT_USER_ID}
      canSeeInternal={canSeeInternalNotes(role)}
      canEdit={canChangeStatus(role)}
    />
  );
}
