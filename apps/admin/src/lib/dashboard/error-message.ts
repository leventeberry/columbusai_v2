/** Map server-fn / API errors to operator-friendly dashboard copy. */
export function formatDashboardError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Could not load dashboard data.";

  const lower = message.toLowerCase();

  if (lower.includes("no session") || lower.includes("invalid session")) {
    return "Your session expired or is missing. Sign out and sign in again with an admin account.";
  }

  if (lower.includes("forbidden") || lower.includes("admin role required")) {
    return "Your account does not have admin access to sales data. Sign in with the seed admin or an admin-role user.";
  }

  if (lower.includes("admin api not configured")) {
    return "The API is not configured for admin access. Ensure SESSION_SECRET and database migrations are applied, then restart the stack.";
  }

  if (lower.includes("unauthorized")) {
    return "You are not authorized to load sales data. Sign in again at /login.";
  }

  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("econnrefused")) {
    return "Could not reach the API. Check that the API container is running and SALES_API_URL is set correctly.";
  }

  return message || "Could not load dashboard data.";
}
