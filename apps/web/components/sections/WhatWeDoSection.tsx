import { Zap, Link2, Share2, BarChart3 } from "lucide-react";
import FeatureCard from "./FeatureCard";

const ITEMS = [
  {
    icon: Zap,
    title: "Eliminate busywork",
    description:
      "We design and implement reliable automation systems that remove manual busywork and operational bottlenecks so your team can focus on what matters.",
  },
  {
    icon: Link2,
    title: "Connect your existing tools",
    description:
      "We wire the tools you already use — CRM, email, SMS, scheduling, forms, payments, and internal platforms — into one streamlined workflow.",
  },
  {
    icon: Share2,
    title: "Capture and route instantly",
    description:
      "Workflows that capture leads instantly, route tasks intelligently, reduce response times, and ensure nothing falls through the cracks.",
  },
  {
    icon: BarChart3,
    title: "Practical, scalable systems",
    description:
      "We focus on revenue flow, operational consistency, and visibility — structured systems that save time, reduce errors, and scale with growth, not hype-driven AI.",
  },
] as const;

export default function WhatWeDoSection() {
  return (
    <section
      id="what-we-do"
      className="bg-muted px-4 py-12 md:py-16"
      aria-labelledby="what-we-do-title"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="what-we-do-title"
          className="mb-2 mt-6 text-3xl font-semibold text-foreground"
        >
          What we do
        </h2>
        <p className="mb-6 mt-2 text-foreground">
          Reasons we&apos;re the best choice to automate your operations:
        </p>
        <ul className="my-4 grid gap-4 md:grid-cols-2 md:grid-rows-[1fr_1fr]">
          {ITEMS.map((item) => (
            <li key={item.title} className="min-h-0">
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
