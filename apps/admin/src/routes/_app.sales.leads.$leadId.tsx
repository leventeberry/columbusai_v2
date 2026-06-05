import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sales/leads/$leadId")({
  head: ({ params }) => ({
    meta: [{ title: `Lead ${params.leadId.slice(0, 8)}… — Columbus AI` }],
  }),
  component: LeadDetailRedirect,
});

function LeadDetailRedirect() {
  const { leadId } = Route.useParams();
  return (
    <Navigate
      to="/sales/leads"
      search={{ leadId }}
      replace
    />
  );
}
