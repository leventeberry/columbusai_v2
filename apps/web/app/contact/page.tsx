import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/ContactForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_NAME}. Send us a message and we'll get back to you soon.`,
};

export default function ContactPage() {
  return (
    <Section as="article" variant="default">
      <Container maxWidth="2xl" className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Contact us
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you as soon as we can.
          </p>
        </header>
        <div className="max-w-xl">
          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}
