"use client";

import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";
import PricingPlans from "@/components/PricingSection";
import ContentTypes from "@/components/AvailableContent";
import TabSection from "@/components/StepsVideos";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TabSection />
      <ContentTypes />
      <PricingPlans />
      <FAQSection />
      <FooterSection />
    </>
  );
}
