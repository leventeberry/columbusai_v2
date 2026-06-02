import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Activity, Globe, Users, Workflow, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Business Impact",
    value: "$48.2k",
    sub: "+18% MoM",
    icon: TrendingUp,
    accent: "text-[color:var(--success)]",
  },
  {
    label: "Active Automations",
    value: "127",
    sub: "All healthy",
    icon: Zap,
    accent: "text-[color:var(--brand-violet)]",
  },
  {
    label: "Website Status",
    value: "Operational",
    sub: "99.99% uptime",
    icon: Globe,
    accent: "text-[color:var(--brand-cyan)]",
  },
  {
    label: "Leads Captured",
    value: "342",
    sub: "this month",
    icon: Users,
    accent: "text-[color:var(--brand-indigo)]",
  },
  {
    label: "Client Requests",
    value: "12 open",
    sub: "4 in review",
    icon: Workflow,
    accent: "text-[color:var(--warning)]",
  },
  {
    label: "Workflow Health",
    value: "98.7%",
    sub: "success rate",
    icon: Activity,
    accent: "text-[color:var(--success)]",
  },
];

export function Hero() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  const handleDemo = () => {
    if (location.pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ to: "/contact" });
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div
        className="absolute inset-x-0 top-0 h-[600px]"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-subtle surface-2 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] animate-pulse" />
            Managed AI Operations Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]">
            Automate the busywork.
            <br />
            <span className="text-gradient">Operate with clarity.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Columbus AI builds and manages automation systems, client portals, websites,
            integrations, and operational workflows that help businesses respond faster, save time,
            and scale without chaos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={handleDemo}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow group"
            >
              Request a Demo
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-strong bg-card/40 backdrop-blur"
            >
              <Link to="/platform">View Platform</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 lg:mt-20"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-strong surface-1 shadow-elevated overflow-hidden">
      <div className="absolute -inset-px rounded-2xl bg-gradient-primary opacity-20 blur-2xl -z-10" />
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-subtle surface-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
          columbusai.tech/console
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Operations Overview
            </div>
            <div className="text-lg font-semibold text-foreground mt-0.5">
              Today · All systems nominal
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-subtle surface-2 p-4 hover:border-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`h-3.5 w-3.5 ${s.accent}`} />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
              <Sparkline />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkline() {
  const points = [4, 8, 6, 12, 9, 14, 11, 18, 16, 22, 20, 26];
  const max = Math.max(...points);
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${30 - (p / max) * 28}`)
    .join(" L");
  return (
    <svg viewBox="0 0 100 30" className="mt-3 w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.19 280)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.7 0.19 280)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${d} L100,30 L0,30 Z`} fill="url(#sp)" />
      <path d={`M${d}`} fill="none" stroke="oklch(0.7 0.19 280)" strokeWidth="1.5" />
    </svg>
  );
}
