import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { CONTACT_EMAIL, getAdminLoginUrl } from "@/lib/env";

export function Footer() {
  return (
    <footer className="border-t border-subtle surface-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-foreground">Columbus AI</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Managed AI operations for businesses that want to move faster without the chaos.
            </p>
          </div>

          <Col title="Platform">
            <FLink to="/services">Website Management</FLink>
            <FLink to="/services">Workflow Automation</FLink>
            <FLink to="/services">Client Portals</FLink>
            <FLink to="/services">Integrations</FLink>
            <FLink to="/services">Reporting</FLink>
          </Col>
          <Col title="Access">
            <FLink to="/client">Client Login</FLink>
            <FExternalLink href={getAdminLoginUrl()}>Admin Login</FExternalLink>
            <FLink to="/contact">Request Demo</FLink>
          </Col>
          <Col title="Legal">
            <FLink to="/privacy">Privacy Policy</FLink>
            <FLink to="/terms">Terms</FLink>
          </Col>
        </div>
        <div className="mt-12 pt-8 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 Columbus AI Automation Solutions LLC. All rights reserved.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function FExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    </li>
  );
}
