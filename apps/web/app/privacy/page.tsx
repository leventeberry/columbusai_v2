import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. How we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return (
    <article className="bg-background px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: February 2025. {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Information We Collect
          </h2>
          <p className="text-muted-foreground">
            We may collect information you provide when you contact us or request a demo, such as your name, email address, company name, and any message content. We may also collect usage data (e.g., pages visited, referring site) when you use our website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            How We Use Your Information
          </h2>
          <p className="text-muted-foreground">
            We use your information to respond to inquiries, schedule and deliver demos, improve our services and website, and communicate with you about our offerings. We do not sell your personal information.
          </p>
        </section>

        <section id="cookies" className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Cookies and Similar Technologies
          </h2>
          <p className="text-muted-foreground">
            Our website may use cookies and similar technologies for functionality and analytics. You can adjust your browser settings to limit or block cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            We may use third-party services (e.g., for scheduling, hosting, or analytics). Those services have their own privacy policies governing how they handle data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Retention and Security
          </h2>
          <p className="text-muted-foreground">
            We retain your information only as long as needed for the purposes described above or as required by law. We take reasonable steps to protect your data from unauthorized access or disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Your Rights
          </h2>
          <p className="text-muted-foreground">
            Depending on your location, you may have rights to access, correct, or delete your personal information, or to object to or restrict certain processing. To exercise these rights or ask questions about this policy, please contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="text-muted-foreground">
            For privacy-related questions or requests, please reach out through our website or the contact information provided there.
          </p>
        </section>

        <p className="pt-4">
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </article>
  );
}
