import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "What does Columbus AI actually build?",
    a: "Hosted websites, workflow automations, client portals, integrations, AI assistants, and reporting — managed as one system.",
  },
  {
    q: "Do you replace my current tools?",
    a: "No. We connect what you already use (CRM, calendar, email, payments) and add automation on top.",
  },
  {
    q: "Can you work with my existing website?",
    a: "Yes. We can host and improve it, or rebuild it if a new site would serve you better.",
  },
  {
    q: "Do clients get their own portal?",
    a: "Yes. Every client gets a portal with visibility into results, requests, reports, billing, and documents.",
  },
  {
    q: "Can you integrate with my CRM?",
    a: "We integrate with HubSpot, GoHighLevel, and most modern CRMs via native APIs or middleware.",
  },
  {
    q: "How long does setup take?",
    a: "Most launches go live within 1–3 weeks depending on scope. Complex stacks take longer and are scoped up front.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes. Every plan includes ongoing support and a request channel through the client portal.",
  },
  {
    q: "Is the AI chat widget included?",
    a: "Yes — use the chat button on this site to try our assistant. Custom AI chat and workflow integrations are available on Growth and Scale plans.",
  },
  {
    q: "How do I access the client portal?",
    a: "Active clients receive credentials at onboarding. The portal lives at /client.",
  },
  {
    q: "Is the admin portal only for Columbus AI?",
    a: "Yes. The admin portal is restricted to Columbus AI operators.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 border-t border-subtle">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." align="center" />
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-subtle">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
