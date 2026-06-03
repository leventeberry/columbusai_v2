import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({ meta: [{ title: "Sign in — Columbus AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate({ to: search.redirect || "/dashboard" });
    }
  }, [isAuthenticated, isLoading, search.redirect, navigate]);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.68_0.18_280/0.15),transparent_60%)]" />
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border/60 bg-card/60 p-7 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-2 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Columbus AI</div>
            <div className="text-[11px] text-muted-foreground">Operations Console</div>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the Columbus AI command center.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@columbus.ai"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        {import.meta.env.DEV && (
          <p className="text-center text-xs text-muted-foreground">
            Dev seed: admin@columbusai.com — password from <code className="text-[10px]">SEED_ADMIN_PASSWORD</code> in{" "}
            <code className="text-[10px]">.env.local</code>
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          New workspace?{" "}
          <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
            Create the first admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
