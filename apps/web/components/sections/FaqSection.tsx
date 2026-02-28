import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const FAQ_ITEMS = [
  {
    q: "What tools do you use?",
    a: "We work with the tools you already use: CRMs (HubSpot, Salesforce, etc.), email, SMS, scheduling (Calendly, Acuity), spreadsheets, Slack, Teams, and more. No lock-in.",
  },
  {
    q: "How long does setup take?",
    a: "Most initial automations are live within 2–4 weeks. Complex workflows may take longer; we'll give you a timeline after discovery.",
  },
  {
    q: "Do I need to give you access to my systems?",
    a: "Yes — we need limited access to connect and build. We use read-only where possible and follow security best practices. You can revoke access anytime.",
  },
  {
    q: "Is my data secure?",
    a: "We don't store your customer data on our own servers. Automations run in your existing tools and any logs are handled per your agreements.",
  },
  {
    q: "What if I need changes later?",
    a: "Monthly support includes updates and tweaks. One-off changes can be scoped as needed.",
  },
  {
    q: "How do I measure ROI?",
    a: "We focus on outcomes you can measure: time saved, response time, conversion lift, and fewer missed tasks. We'll help you define and track these.",
  },
  {
    q: "Do you do chatbots?",
    a: "We focus on workflow automation (routing, follow-up, internal ops), not conversational AI. If a simple chatbot fits your workflow, we can discuss.",
  },
] as const;

export default function FaqSection() {
  return (
    <Section
      id="faq"
      className="bg-muted px-4 py-12 md:py-16"
      ariaLabelledby="faq-title"
    >
      <Container>
        <h2
          id="faq-title"
          className="mb-2 mt-6 text-2xl font-semibold text-foreground"
        >
          FAQ
        </h2>
        <dl className="my-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q}>
              <dt className="mt-4 font-semibold text-foreground first:mt-0">
                {item.q}
              </dt>
              <dd className="mb-2 ml-0 text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
