"use client";

import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/hero/FeatureSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";
import PricingPlans from "@/components/PricingSection";
import ProgressSteps from "@/components/features-steps/BentoGrid";
import ContentTypes from "@/components/AvailableContent";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProgressSteps />
      <FeatureSection />
      <ContentTypes />
      <PricingPlans />
      <FAQSection />
      <FooterSection />
    </>
  );
}
