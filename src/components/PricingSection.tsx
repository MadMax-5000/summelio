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

// Updated FeatureTooltip component to accept plan type for styling
const FeatureTooltip = ({
  feature,
  tooltipText,
  planType,
}: {
  feature: string;
  tooltipText: string;
  planType: "pro" | "business";
}) => {
  // Different tooltip styles based on plan type
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

  // Track which plan the user wants to purchase
  const [selectedPlan, setSelectedPlan] = useState<{
    type: "pro" | "business";
    productId: string;
  } | null>(null);

  // Track when a purchase flow is in progress
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Get user's subscription data
  const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery(
    undefined,
    { enabled: !!isSignedIn }
  );

  // Price display state
  const [isAnnual, setIsAnnual] = useState(false);
  const [proPriceDisplay, setProPriceDisplay] = useState("19");
  const [businessPriceDisplay, setBusinessPriceDisplay] = useState("39");

  // Pricing constants
  const proMonthlyPrice = 19;
  const businessMonthlyPrice = 39;
  const annualDiscount = 0.17; // 17% discount

  const proAnnualPrice = Math.round(proMonthlyPrice * 12 * (1 - annualDiscount)) / 12;
  const businessAnnualPrice = Math.round(businessMonthlyPrice * 12 * (1 - annualDiscount)) / 12;

  // Effect to check if user needs to be redirected to the pricing section
  useEffect(() => {
    if (isLoaded && isSignedIn && subscription && !subscription.isSubscribed) {
      // User is logged in but has no active subscription
      // URL check to avoid redirect loops
      if (window.location.pathname === "/dashboard" && !window.location.hash.includes("pricing")) {
        window.location.href = "/#pricing";
      }
    }
  }, [isLoaded, isSignedIn, subscription]);

  // Handle plan selection and redirection flow
  const handlePlanSelection = async (planType: "pro" | "business", productId: string) => {
    // Store which plan was selected
    setSelectedPlan({ type: planType, productId });

    // If not signed in, redirect to sign-in with redirect URL
    if (!isSignedIn) {
      const redirectUrl = `/initiate-checkout?productId=${productId}`;
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
      return;
    }

    // Check if user already has this plan
    if (subscription?.priceId === productId && subscription?.isSubscribed) {
      toast.info(`You already have the ${planType === "pro" ? "Pro" : "Business"} plan!`);
      return;
    }

    // * Check if the user is attempting to downgrade
    if (subscription?.isSubscribed && planType === "pro" && subscription.plan === "Business") {
      toast.warning(
        "Downgrading to the Pro plan requires canceling your current Business subscription first. Please contact support or visit your account settings."
      );
      return;
    }

    // Start purchase flow
    await initiatePurchase(productId);
  };

  // Initiate the purchase flow
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

  // Price animation effect - calculate based on annual vs monthly
  useEffect(() => {
    const proTarget = isAnnual ? proAnnualPrice : proMonthlyPrice;
    const businessTarget = isAnnual ? businessAnnualPrice : businessMonthlyPrice;

    const proStart = Number.parseInt(proPriceDisplay);
    const businessStart = Number.parseInt(businessPriceDisplay);

    // Animate price changes
    const animateValue = (
      start: number,
      end: number,
      setter: (value: string) => void,
      duration: number = 500
    ) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (startTimestamp === null) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        setter(currentValue.toString());
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setter(Math.floor(end).toString());
        }
      };
      window.requestAnimationFrame(step);
    };

    animateValue(proStart, proTarget, setProPriceDisplay);
    animateValue(businessStart, businessTarget, setBusinessPriceDisplay);
  }, [isAnnual, proAnnualPrice, businessAnnualPrice]);

  const proFeatures = [
    { feature: "20 PDFs", tooltip: "Upload up to 20 PDF documents per month." },
    {
      feature: "50 Pages per PDF",
      tooltip: "Each PDF can include up to 50 pages.",
    },
    {
      feature: "50 Web Pages",
      tooltip: "Upload up to 50 web pages every month.",
    },
    {
      feature: "Instant AI Chat",
      tooltip:
        "Chat with your documents in real time and get instant, accurate answers.",
    },
    {
      feature: "Smart & Accurate Responses",
      tooltip:
        "Our AI understands your content and gives accurate, context-driven responses every time.",
    },
    {
      feature: "24/7 Email Support",
      tooltip: "Access round-the-clock assistance from support team.",
    },
  ];

  const businessFeatures = [
    {
      feature: "Unlimited PDFs",
      tooltip: "Upload up to 50 PDF documents per month.",
    },
    {
      feature: "2000 Pages per PDF",
      tooltip: "Each PDF can include up to 200 pages.",
    },
    {
      feature: "Unlimited Web Pages",
      tooltip: "Upload up to 100 web pages every month.",
    },
    {
      feature: "Instant AI Chat",
      tooltip:
        "Chat with your documents in real time and get instant, accurate answers.",
    },
    {
      feature: "Smart & Accurate Responses",
      tooltip:
        "Our AI understands your content and gives accurate, context-driven responses every time.",
    },
    {
      feature: "Enhanced AI Accuracy",
      tooltip:
        "Benefit from refined AI responses for complex, in-depth content.",
    },
    {
      feature: "Priority 24/7 Support",
      tooltip:
        "Access our top-tier support team anytime, with priority handling for your business-critical needs.",
    },
  ];

  return (
    <section id="pricing">
      <div className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-16 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Plans & Pricing
          </h1>
          <div className="flex items-center gap-3">
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${isAnnual ? "bg-indigo-500" : "bg-gray-200"} cursor-pointer`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isAnnual ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Pay annually and</span>
              <span className="text-sm font-semibold text-indigo-600 relative ml-2">
                save up to 17%
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="5"
                  viewBox="0 0 80 5"
                >
                  <path
                    d="M0,3 Q40,0 80,3"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border-2 border-gray-200 transition-colors duration-200 hover:border-indigo-600">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Pro</h2>
              <div className="flex items-baseline mb-2 h-14">
                <span className="text-4xl font-bold relative overflow-hidden">
                  <span
                    className="inline-block relative"
                    style={{ minWidth: "3.2ch" }}
                  >
                    ${proPriceDisplay}
                  </span>
                </span>
                <span className="text-gray-500">
                  {isAnnual ? "per month, billed annually" : "monthly"}
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection("pro", "716126")}
                disabled={isPurchasing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-medium mt-4 rounded-md disabled:opacity-70"
              >
                {isPurchasing ? "Processing..." :
                  subscription?.priceId === "716126" && subscription?.isSubscribed
                    ? "Current Plan"
                    : "Get Started"}
              </button>
            </div>

            <p className="text-gray-800 mb-6 font-bold">
              For newbies and small teams:
            </p>
            <ul className="space-y-4">
              {proFeatures.map(({ feature, tooltip }) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                  <FeatureTooltip
                    feature={feature}
                    tooltipText={tooltip}
                    planType="pro"
                  />
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
                  <span
                    className="inline-block relative"
                    style={{ minWidth: "3.2ch" }}
                  >
                    ${businessPriceDisplay}
                  </span>
                </span>
                <span className="text-indigo-100">
                  {isAnnual ? "per month, billed annually" : "monthly"}
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection("business", "716134")}
                disabled={isPurchasing}
                className="w-full bg-white hover:bg-indigo-50 text-indigo-700 h-11 font-medium mt-4 rounded-md disabled:opacity-70"
              >
                {isPurchasing ? "Processing..." :
                  subscription?.priceId === "716134" && subscription?.isSubscribed
                    ? "Current Plan"
                    : "Get Started"}
              </button>
            </div>

            <p className="text-white mb-6 font-bold">
              For agencies and growing businesses:
            </p>
            <ul className="space-y-4">
              {businessFeatures.map(({ feature, tooltip }) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                  <FeatureTooltip
                    feature={feature}
                    tooltipText={tooltip}
                    planType="business"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Current subscription information */}
      {isSignedIn && subscription && !isLoadingSubscription && subscription.isSubscribed && (
        <div className="mt-8 text-center">
          <p className="text-gray-700">
            Your current plan: <span className="font-bold">{subscription.plan}</span>
            {subscription.subscriptionEnds && (
              <span> (renews on {new Date(subscription.subscriptionEnds).toLocaleDateString()})</span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}