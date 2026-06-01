import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const hasSessionCookie = createIsomorphicFn()
  .server(() => getCookie("portal_session") === "1")
  .client(() =>
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((c) => c.startsWith("portal_session=1")),
  );

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: hasSessionCookie() ? "/dashboard" : "/login",
      replace: true,
    });
  },
  component: () => null,
});
