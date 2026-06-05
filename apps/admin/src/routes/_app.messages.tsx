import { createFileRoute, Link } from "@tanstack/react-router";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [{ title: "Messages — Columbus AI" }],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <div className="space-y-4">
      <ComingSoon
        title="Messages"
        subtitle="Unified inbox for client and lead conversations."
        icon={MessageSquare}
        message="Unified messages inbox is Sprint 2+. Sales conversations are available now."
      />
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/sales/conversations">Open sales conversations</Link>
        </Button>
      </div>
    </div>
  );
}
