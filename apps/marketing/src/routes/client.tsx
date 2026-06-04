import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { getPortalLoginUrl } from "@/lib/env";

/** Legacy /client path — redirect to the live client portal. */
export const Route = createFileRoute("/client")({
  head: () => {
    const target = getPortalLoginUrl();
    return {
      meta: [
        { title: "Client Portal — Columbus AI" },
        { name: "description", content: "Redirecting to the Columbus AI client portal." },
        { name: "robots", content: "noindex" },
        { httpEquiv: "refresh", content: `0;url=${target}` },
      ],
    };
  },
  component: ClientRedirect,
});

function ClientRedirect() {
  const target = getPortalLoginUrl();

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <div className="grid min-h-[40vh] place-items-center px-4">
      <p className="text-sm text-muted-foreground">
        Redirecting to the{" "}
        <a href={target} className="text-primary underline-offset-4 hover:underline">
          client portal
        </a>
        …
      </p>
    </div>
  );
}
