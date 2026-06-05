import { createFileRoute } from "@tanstack/react-router";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { PageHeader, Section } from "@/components/dashboard/page-header";
export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Columbus AI" },
      { name: "description", content: "Operator tasks due today and overdue." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        subtitle="Due today and overdue — full task queue API coming in a later sprint."
      />
      <Section title="Today's tasks" subtitle="Adapter-backed until admin tasks API ships.">
        <TodaysTasks />
      </Section>
    </div>
  );
}
