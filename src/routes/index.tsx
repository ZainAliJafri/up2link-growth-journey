import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/site/Navigation";
import { HeroSection } from "@/components/site/HeroSection";
import {
  AcquisitionEngine,
  CaseStudies,
  CommitmentNotice,
  ExecutionTimeline,
  HowItWorks,
  PositioningSection,
  PricingSection,
  ProblemSection,
  WhyUp2linkd,
} from "@/components/site/Sections";
import { FAQAccordion, FinalCTA, Footer } from "@/components/site/Conversion";
import type { PackageId } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "up2linkd — Two channels. One acquisition engine." },
      { name: "description", content: "up2linkd helps B2B agencies build structured client acquisition through Upwork, LinkedIn, or both. 90-day minimum engagements." },
      { property: "og:title", content: "up2linkd — Stop chasing growth. Build the engine." },
      { property: "og:description", content: "Structured Upwork and LinkedIn client acquisition for B2B agencies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [selected, setSelected] = useState<PackageId | "unsure" | "">("");
  const [focusToken, setFocusToken] = useState(0);

  const openForm = (pkg?: PackageId) => {
    if (pkg) setSelected(pkg);
    setFocusToken((n) => n + 1);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-x-clip">
      <Navigation onBook={() => openForm()} />
      <main>
        <HeroSection onPrimary={() => openForm()} />
        <PositioningSection />
        <ProblemSection />
        <AcquisitionEngine />
        <PricingSection onSelect={(id) => openForm(id)} />
        <CommitmentNotice />
        <ExecutionTimeline />
        <HowItWorks />
        <CaseStudies />
        <WhyUp2linkd />
        <FAQAccordion />
        <FinalCTA selected={selected} focusToken={focusToken} onPrimary={() => openForm()} />
      </main>
      <Footer />
    </div>
  );
}
