import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { SESSION_COOKIE } from "@/lib/auth-middleware";

const hasSessionCookie = createIsomorphicFn()
  .server(() => !!getCookie(SESSION_COOKIE))
  .client(() =>
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_COOKIE}=`)),
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
