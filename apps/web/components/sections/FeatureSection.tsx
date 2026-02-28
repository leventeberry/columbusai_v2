import { Workflow, Zap, Link2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { getGridClass } from "@/components/layout/grid";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    icon: Workflow,
    title: "Workflow automation",
    description:
      "Automate repetitive processes so your team can focus on high-value work.",
  },
  {
    icon: Zap,
    title: "Faster response times",
    description:
      "Deploy bots and integrations that respond in real time to customers and internal requests.",
  },
  {
    icon: Link2,
    title: "System integration",
    description:
      "Connect your existing tools and data so automation works across your entire stack.",
  },
] as const;

export default function FeatureSection() {
  return (
    <Section variant="bare">
      <Container>
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          What we offer
        </h2>
        <ul className={getGridClass("features")}>
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
