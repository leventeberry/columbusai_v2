import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

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
            Last updated: February 2026. By accessing or using the {SITE_NAME} website (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) and our services, you agree to these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use our website or services.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Use of Our Services
          </h2>
          <p className="text-muted-foreground">
            You may use our website and chatbot for lawful purposes only. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Interfere with or disrupt the operation of our website or services</li>
            <li>Attempt to gain unauthorized access to any part of the website, servers, or systems</li>
            <li>Use our services in violation of applicable laws or regulations</li>
            <li>Copy or exploit content from our website without our permission</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Chatbot and AI-Generated Content
          </h2>
          <p className="text-muted-foreground">
            Our chatbot provides responses for informational purposes only. By using it, you acknowledge:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>The chatbot uses AI to generate responses, which may not always be accurate, complete, or applicable to your situation</li>
            <li>Responses are not professional advice and should not be relied upon as a substitute for consulting a qualified professional</li>
            <li>We are not responsible for any decisions made based on chatbot responses</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Collection and Processing
          </h2>
          <p className="text-muted-foreground">
            We collect minimal information to operate our services and maintain conversation continuity. This may include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>IP addresses (used to identify user sessions and prevent abuse)</li>
            <li>Chat messages submitted through the chatbot</li>
            <li>Contact information voluntarily provided by users</li>
          </ul>
          <p className="text-muted-foreground">
            We process this information under the principle of legitimate interest to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Provide chatbot services</li>
            <li>Maintain conversation sessions</li>
            <li>Ensure system security and prevent abuse</li>
          </ul>
          <p className="text-muted-foreground">
            We do not use analytics, marketing pixels, or tracking cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Rights of EU Users
          </h2>
          <p className="text-muted-foreground">
            If you are located in the EU, you have the following rights under GDPR:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Restriction:</strong> Request limitation of processing under certain conditions</li>
            <li><strong>Objection:</strong> Object to processing for legitimate interests</li>
            <li><strong>Data portability:</strong> Request your data in a structured, machine-readable format</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise your rights, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
            . We will respond within applicable legal timelines.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Lead Information and Contact
          </h2>
          <p className="text-muted-foreground">
            When you provide contact information via our chatbot or website:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You consent to us contacting you regarding your inquiry and our professional services</li>
            <li>We store this information only for managing communications and providing services</li>
            <li>We do not share your personal information with third parties except as required by law</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            All website content, including text, images, code, UI components, and designs, is owned by {SITE_NAME} unless otherwise stated. You may not:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Copy, reproduce, or redistribute content</li>
            <li>Create derivative works without written permission</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Service Availability and Maintenance
          </h2>
          <p className="text-muted-foreground">
            We strive to keep our website and chatbot available, but do not guarantee uninterrupted access. Maintenance, updates, or modifications may occur without prior notice. We are not liable for temporary unavailability or any loss of data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, {SITE_NAME} is not liable for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Any loss, damage, or harm resulting from your use of the website or chatbot</li>
            <li>Decisions made based on chatbot-generated content</li>
            <li>Unauthorized access to or use of your information</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Changes to Terms
          </h2>
          <p className="text-muted-foreground">
            We may update these Terms from time to time. The &quot;Last updated&quot; date will reflect the most recent changes. Continued use of our services indicates acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="text-muted-foreground">
            For questions regarding these Terms or your GDPR rights, please contact us at:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
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
