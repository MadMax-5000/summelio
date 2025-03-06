"use client";

import { Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [proPriceDisplay, setProPriceDisplay] = useState("29");
  const [businessPriceDisplay, setBusinessPriceDisplay] = useState("59");

  const proMonthlyPrice = 29;
  const businessMonthlyPrice = 59;
  const annualDiscount = 0.17; // 17% discount

  const proAnnualPrice =
    Math.round(proMonthlyPrice * 12 * (1 - annualDiscount)) / 12;
  const businessAnnualPrice =
    Math.round(businessMonthlyPrice * 12 * (1 - annualDiscount)) / 12;

  // Animate value function with proper types
  const animateValue = useCallback(
    (
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
    },
    []
  );

  useEffect(() => {
    const proTarget = isAnnual ? proAnnualPrice : proMonthlyPrice;
    const businessTarget = isAnnual
      ? businessAnnualPrice
      : businessMonthlyPrice;

    const proStart = Number.parseInt(proPriceDisplay);
    const businessStart = Number.parseInt(businessPriceDisplay);

    animateValue(proStart, proTarget, setProPriceDisplay);
    animateValue(businessStart, businessTarget, setBusinessPriceDisplay);
  }, [
    isAnnual,
    proPriceDisplay,
    businessPriceDisplay,
    proAnnualPrice,
    businessAnnualPrice,
    animateValue,
  ]);

  return (
    <section id="pricing">
      <div className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-16 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Plans & Pricing
          </h1>
          <div className="flex items-center gap-3">
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                isAnnual ? "bg-indigo-500" : "bg-gray-200"
              } cursor-pointer`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
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
                    className="inline-block relative "
                    style={{ minWidth: "3.2ch" }}
                  >
                    ${proPriceDisplay}
                  </span>
                </span>
                <span className="text-gray-500">
                  {isAnnual ? "per month, billed annually" : "monthly"}
                </span>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-medium mt-4 rounded-md">
                Try for free
              </button>
            </div>

            <p className="text-gray-600 mb-6">For newbies and small teams:</p>
            <ul className="space-y-4">
              {[
                "5 projects",
                "500 keywords to track",
                "10,000 results per report",
                "Competitor analysis",
                "Keyword research tools",
                "24/7 email support",
              ].map((feature) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
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
              <button className="w-full bg-white hover:bg-indigo-50 text-indigo-700 h-11 font-medium mt-4 rounded-md">
                Try for free
              </button>
            </div>

            <p className="text-white mb-6">
              For agencies and growing businesses:
            </p>
            <ul className="space-y-4">
              {[
                "15 projects",
                "1,500 keywords to track",
                "30,000 results per report",
                "Advanced competitor analysis",
                "All research tools included",
                "Priority 24/7 support",
                "API access",
                "Custom reporting",
              ].map((feature) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
