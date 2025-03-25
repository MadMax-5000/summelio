"use client";

import { HelpCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/_trpc/client";

const FeatureTooltip = ({
  feature,
  tooltipText,
  planType,
}: {
  feature: string;
  tooltipText: string;
  planType: "pro" | "business";
}) => {
  const tooltipStyles = {
    pro: "max-w-xs p-2 bg-indigo-500 text-gray-100",
    business: "max-w-xs p-2 bg-indigo-100 text-gray-700",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="cursor-default ml-1.5">
          <HelpCircle
            className={`h-4 w-4 ${planType === "pro" ? "text-zinc-500" : "text-white"}`}
          />
        </TooltipTrigger>
        <TooltipContent className={tooltipStyles[planType]}>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function PricingSection() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<{
    type: "pro" | "business";
    productId: string;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery(
    undefined,
    { enabled: !!isSignedIn }
  );

  const [proPriceDisplay, setProPriceDisplay] = useState("19");
  const [businessPriceDisplay, setBusinessPriceDisplay] = useState("39");

  const proMonthlyPrice = 19;
  const businessMonthlyPrice = 39;

  // Helper functions for determining plan status
  const isPlanActive = (planId) => {
    return subscription?.isSubscribed && subscription.priceId === planId;
  };

  const getCurrentPlan = () => {
    if (!subscription?.isSubscribed) return null;
    if (subscription.priceId === "729861") return "Pro";
    if (subscription.priceId === "729862") return "Business";
    return subscription.plan; // Fallback
  };

  useEffect(() => {
    if (subscription) {
      console.log("Current subscription:", subscription);
    }
  }, [subscription]);

  useEffect(() => {
    if (isLoaded && isSignedIn && subscription && !subscription.isSubscribed) {
      if (window.location.pathname === "/dashboard" && !window.location.hash.includes("pricing")) {
        window.location.href = "/#pricing";
      }
    }
  }, [isLoaded, isSignedIn, subscription]);

  const handlePlanSelection = async (planType: "pro" | "business", productId: string) => {
    setSelectedPlan({ type: planType, productId });
    if (!isSignedIn) {
      const redirectUrl = `/initiate-checkout?productId=${productId}`;
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
      return;
    }
    if (subscription?.priceId === productId && subscription?.isSubscribed) {
      toast.info(`You already have the ${planType === "pro" ? "Pro" : "Business"} plan!`);
      return;
    }
    if (subscription?.isSubscribed && planType === "pro" && getCurrentPlan() === "Business") {
      toast.warning(
        "Downgrading to the Pro plan requires canceling your current Business subscription first. Please contact support or visit your account settings."
      );
      return;
    }
    await initiatePurchase(productId);
  };

  const initiatePurchase = async (productId: string) => {
    if (!user) return;
    try {
      setIsPurchasing(true);
      const response = await axios.post("/api/subscribe", {
        productId,
        userId: user.id,
      });
      if (response.data.checkoutUrl) {
        window.location.assign(response.data.checkoutUrl);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const proFeatures = [
    { feature: "20 PDFs", tooltip: "Upload up to 20 PDF documents per month." },
    { feature: "50 Web Pages", tooltip: "Upload up to 50 web pages every month." },
    { feature: "50 Youtube Videos", tooltip: "Upload up to 50 youtube videos every month." },
    { feature: "Instant AI Chat", tooltip: "Chat with your documents in real time and get instant, accurate answers." },
    { feature: "Smart & Accurate Responses", tooltip: "Our AI understands your content and gives accurate, context-driven responses every time." },
    { feature: "24/7 Email Support", tooltip: "Access round-the-clock assistance from support team." },
  ];

  const businessFeatures = [
    { feature: "Unlimited PDFs", tooltip: "Upload unlimited PDF documents per month." },
    { feature: "Unlimited Web Pages", tooltip: "Upload unlimited web pages every month." },
    { feature: "Unlimited Youtube Videos", tooltip: "Upload unlimited youtube videos every month." },
    { feature: "Instant AI Chat", tooltip: "Chat with your documents in real time and get instant, accurate answers." },
    { feature: "Smart & Accurate Responses", tooltip: "Our AI understands your content and gives accurate, context-driven responses every time." },
    { feature: "Priority 24/7 Support", tooltip: "Access our top-tier support team anytime, with priority handling for your business-critical needs." },
    { feature: "Enhanced AI Accuracy", tooltip: "Benefit from refined AI responses for complex, in-depth content." },

  ];

  return (
    <section id="pricing">
      <div className="w-full max-w-7xl mx-auto px-6 py-24 bg-gray-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-16 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Plans & Pricing
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border-2 border-gray-200 transition-colors duration-200 hover:border-indigo-600">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Pro</h2>
              <div className="flex items-baseline mb-2 h-14">
                <span className="text-4xl font-bold relative overflow-hidden">
                  <span className="inline-block relative" style={{ minWidth: "3.2ch" }}>
                    ${proPriceDisplay}
                  </span>
                </span>
                <span className="text-gray-500">monthly</span>
              </div>
              <button
                onClick={() => handlePlanSelection("pro", "729861")}
                disabled={isPurchasing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-medium mt-4 rounded-md disabled:opacity-70"
              >
                {isPurchasing
                  ? "Processing..."
                  : isPlanActive("729861")
                    ? "Current Plan"
                    : getCurrentPlan() === "Business"
                      ? "Downgrade"
                      : "Get Started"}
              </button>
            </div>
            <p className="text-gray-800 mb-6 font-bold">For newbies and small teams:</p>
            <ul className="space-y-4">
              {proFeatures.map(({ feature, tooltip }) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                  <FeatureTooltip feature={feature} tooltipText={tooltip} planType="pro" />
                </li>
              ))}
            </ul>
          </div>

          {/* Business Plan */}
          <div className="bg-indigo-400 rounded-2xl shadow-sm p-8 border-2 border-indigo-500 relative transition-colors duration-200 hover:border-indigo-700">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-bl-lg rounded-tr-xl">
              MOST POPULAR
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Business</h2>
              <div className="flex items-baseline mb-2 h-14">
                <span className="text-4xl font-bold relative overflow-hidden text-white">
                  <span className="inline-block relative" style={{ minWidth: "3.2ch" }}>
                    ${businessPriceDisplay}
                  </span>
                </span>
                <span className="text-indigo-100">monthly</span>
              </div>
              <button
                onClick={() => handlePlanSelection("business", "729862")}
                disabled={isPurchasing}
                className="w-full bg-white hover:bg-indigo-50 text-indigo-700 h-11 font-medium mt-4 rounded-md disabled:opacity-70"
              >
                {isPurchasing
                  ? "Processing..."
                  : isPlanActive("729862")
                    ? "Current Plan"
                    : getCurrentPlan() === "Pro"
                      ? "Upgrade"
                      : "Get Started"}
              </button>
            </div>
            <p className="text-white mb-6 font-bold">For agencies and growing businesses:</p>
            <ul className="space-y-4">
              {businessFeatures.map(({ feature, tooltip }) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                  <FeatureTooltip feature={feature} tooltipText={tooltip} planType="business" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}