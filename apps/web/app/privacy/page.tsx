import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. How we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return (
    <Section as="article" variant="default">
      <Container maxWidth="3xl" className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: February 2026. At {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), we respect your privacy. This Privacy Policy explains how we collect, use, and protect information when you use our website and chatbot services.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Information We Collect
          </h2>
          <p className="text-muted-foreground">
            When you interact with our website or chatbot, we may collect the following:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>IP addresses:</strong> Used to maintain chatbot conversation sessions and prevent abuse</li>
            <li><strong>Chat messages:</strong> Submitted by you to the chatbot</li>
            <li><strong>Contact information:</strong> Voluntarily provided by you (name, email, phone number)</li>
          </ul>
          <p className="text-muted-foreground">
            We do not use analytics tools, marketing pixels, or tracking cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            How We Use Your Information
          </h2>
          <p className="text-muted-foreground">
            We use your information for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Operating and maintaining the chatbot and website</li>
            <li>Ensuring conversation continuity and system security</li>
            <li>Responding to inquiries and providing requested professional services</li>
            <li>Preventing abuse, spam, or misuse of our systems</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Legal Basis for Processing (GDPR)
          </h2>
          <p className="text-muted-foreground">
            For users in the EU, we process personal data under legitimate interest to operate and improve our services, as well as to maintain security.
          </p>
          <p className="text-muted-foreground">
            Consent is required only if you voluntarily provide contact information to receive follow-ups regarding your inquiry.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Retention
          </h2>
          <p className="text-muted-foreground">
            We retain information only for as long as necessary to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Provide our services</li>
            <li>Respond to inquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="text-muted-foreground">
            Data that is no longer required is deleted or anonymized.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Your GDPR Rights
          </h2>
          <p className="text-muted-foreground">
            If you are an EU resident, you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data</li>
            <li><strong>Restriction:</strong> Request limits on processing under certain conditions</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Data portability:</strong> Request your data in a structured, machine-readable format</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise your rights, contact us at:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Sharing
          </h2>
          <p className="text-muted-foreground">
            We do not sell, rent, or trade your personal information.
          </p>
          <p className="text-muted-foreground">
            We may share data with service providers who help operate our website and chatbot, subject to confidentiality agreements, or as required by law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Third-Party Scheduling
          </h2>
          <p className="text-muted-foreground">
            We use a third-party scheduling service (Cal.com) to allow you to book meetings with us.
          </p>
          <p className="text-muted-foreground">
            When you use the scheduling link, you are directed to the service provider&apos;s site and any information you enter there (e.g., name, email, calendar availability) is collected and processed by that provider in accordance with its{" "}
            <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
              privacy policy
            </a>.
          </p>
          <p className="text-muted-foreground">
            We receive booking details from the provider to conduct the meeting; we do not control the provider&apos;s data practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Security
          </h2>
          <p className="text-muted-foreground">
            We take appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy occasionally. The &quot;Last updated&quot; date will reflect the most recent version. Continued use of our services constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="text-muted-foreground">
            For privacy-related questions or requests, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            or through the contact information provided on our website.
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
      </Container>
    </Section>
  );
}
