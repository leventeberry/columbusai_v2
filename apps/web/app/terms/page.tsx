import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <Section as="article" variant="default">
      <Container maxWidth="3xl" className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: February 2025. By using our website and services, you agree to these terms.
          </p>
        </header>

        <p className="text-muted-foreground">
          Full terms of service are in progress. For questions, please contact us through our website.
        </p>

        <p className="pt-4">
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </Container>
    </Section>
  );
}
