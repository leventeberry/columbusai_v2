import type { Metadata } from "next";
import Link from "next/link";
import { notifyUnsubscribeWebhook } from "@/lib/unsubscribe/notifyUnsubscribeWebhook";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You have been unsubscribed from Columbus AI Automation Solutions communications.",
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function UnsubscribePage({ params }: Props) {
  const { token } = await params;

  await notifyUnsubscribeWebhook(token);

  return (
    <article className="bg-background px-4 py-12 md:py-16">
      <div className="mx-auto max-w-xl text-center space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          You are now unsubscribed!
        </h1>
        <p className="text-muted-foreground">
          You will no longer receive marketing emails from Columbus AI Automation
          Solutions. If you change your mind, you can contact us anytime.
        </p>
        <p>
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </article>
  );
}
