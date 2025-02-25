"use client";

import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import { AnimatedBeamBlock } from "@/components/AnimatedBeamBlock";
import { FeatureSection } from "@/components/FeatureSection";
import { FooterSection } from "@/components/FooterSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="space-y-24">
        <Hero />
        <AnimatedBeamBlock />
      </div>
      <FeatureSection />
      <FooterSection />
    </>
  );
}
