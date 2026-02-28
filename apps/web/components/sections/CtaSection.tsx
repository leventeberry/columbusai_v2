import { Check } from "lucide-react";
import RequestDemoBtn from "@/components/RequestDemoBtn";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const BULLETS = [
  "Fast turnaround",
  "Clear documentation",
  "Handoff and training",
  "Ongoing support options",
] as const;

export default function CtaSection() {
  return (
    <Section id="cta" className="bg-background px-4 py-12 md:py-16">
      <Container
        maxWidth="2xl"
        className="space-y-6 rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10 md:py-12"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Request A Demo
        </h2>
        <p className="text-muted-foreground">
          We&apos;ll review your workflows and suggest where to start. We reply
          within 1 business day.
        </p>
        <ul className="my-4 list-none space-y-1 pl-0 text-left">
          {BULLETS.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" />
              <span className="text-foreground">{label}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-center pt-2">
          <RequestDemoBtn />
        </div>
      </Container>
    </Section>
  );
}
