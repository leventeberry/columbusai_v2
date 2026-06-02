import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/portal/AppSidebar";
import { TopBar } from "@/components/portal/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { SESSION_COOKIE } from "@/lib/auth-middleware";
import { hydrateSession } from "@/lib/portal-auth";

const hasSessionCookie = createIsomorphicFn()
  .server(() => !!getCookie(SESSION_COOKIE))
  .client(
    () =>
      typeof document !== "undefined" &&
      document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_COOKIE}=`)),
  );

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!hasSessionCookie()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  useEffect(() => {
    void hydrateSession();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background bg-hero-glow">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
