import { createFileRoute } from "@tanstack/react-router";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { PageHeader } from "@/components/dashboard/page-header";

export const Route = createFileRoute("/_app/clients/")({
  head: () => ({ meta: [{ title: "Clients — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader title="Active clients" subtitle="All paying clients, ranked by recent activity." />
      <ClientsTable />
    </div>
  ),
});
