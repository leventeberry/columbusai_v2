import { Navigate, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

/**
 * Client-side route guard for role-protected pages. Renders children when the
 * user has one of the allowed roles, otherwise redirects to /unauthorized.
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: AppRole[];
  children: ReactNode;
}) {
  const { isLoading, hasAnyRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} />;
  }
  if (!hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" />;
  }
  return <>{children}</>;
}
