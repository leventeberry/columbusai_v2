import CtaSection from "@/components/sections/CtaSection";
import ExampleWorkflowsSection from "@/components/sections/ExampleWorkflowsSection";
import FaqSection from "@/components/sections/FaqSection";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import WhatWeDoSection from "@/components/sections/WhatWeDoSection";
import WhoAndWhatSection from "@/components/sections/WhoAndWhatSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <WhoAndWhatSection />
      <ExampleWorkflowsSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
