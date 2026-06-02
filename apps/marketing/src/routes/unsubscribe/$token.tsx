import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/sections/SiteLayout";
import { processUnsubscribe } from "@/lib/api/unsubscribe.functions";

export const Route = createFileRoute("/unsubscribe/$token")({
  head: () => ({
    meta: [
      { title: "Unsubscribed — Columbus AI" },
      {
        name: "description",
        content: "You have been unsubscribed from Columbus AI Automation Solutions communications.",
      },
    ],
  }),
  loader: async ({ params }) => {
    await processUnsubscribe({ data: { token: params.token } });
  },
  component: UnsubscribePage,
});

function UnsubscribePage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          You are now unsubscribed!
        </h1>
        <p className="text-muted-foreground">
          You will no longer receive marketing emails from Columbus AI Automation Solutions. If you
          change your mind, you can contact us anytime.
        </p>
        <p>
          <Link to="/" className="text-sm text-foreground underline-offset-4 hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}
