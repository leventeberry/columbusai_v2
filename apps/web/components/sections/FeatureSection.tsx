import { Workflow, Zap, Link2 } from "lucide-react";
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
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          What we offer
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
