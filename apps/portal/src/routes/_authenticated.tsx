import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/portal/AppSidebar";
import { TopBar } from "@/components/portal/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { SESSION_COOKIE } from "@/lib/auth-middleware";
import { hydrateSession } from "@/lib/portal-auth";
import { getPortalMe } from "@/lib/portal-session";

const hasSessionCookie = createIsomorphicFn()
  .server(() => !!getCookie(SESSION_COOKIE))
  .client(() => !!getPortalMe());

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!hasSessionCookie()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(() => !!getPortalMe());

  useEffect(() => {
    if (getPortalMe()) {
      setHydrated(true);
      return;
    }

    let cancelled = false;
    void hydrateSession().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        void navigate({ to: "/login" });
        return;
      }
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

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
