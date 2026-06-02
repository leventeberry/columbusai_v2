import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { getAdminLoginUrl } from "@/lib/env";

export const Route = createFileRoute("/admin")({
  head: () => {
    const target = getAdminLoginUrl();
    return {
      meta: [
        { title: "Admin Portal — Columbus AI" },
        { name: "description", content: "Redirecting to the Columbus AI admin dashboard." },
        { name: "robots", content: "noindex" },
        { httpEquiv: "refresh", content: `0;url=${target}` },
      ],
    };
  },
  component: AdminRedirect,
});

function AdminRedirect() {
  const target = getAdminLoginUrl();

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <div className="grid min-h-[40vh] place-items-center px-4">
      <p className="text-sm text-muted-foreground">
        Redirecting to the{" "}
        <a href={target} className="text-primary underline-offset-4 hover:underline">
          admin dashboard
        </a>
        …
      </p>
    </div>
  );
}
