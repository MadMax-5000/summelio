"use client";

import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/hero/BentoGrid";
import FeatureSection from "@/components/hero/FeatureSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <BentoGrid />
      <FeatureSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}
