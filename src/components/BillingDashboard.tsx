"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2, CheckCircle, AlertCircle, CreditCard, CalendarClock, CircleFadingArrowUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// Define the type for subscription data based on getUserSubscription
interface SubscriptionData {
  isSubscribed: boolean;
  plan: string;
  planType: "pro" | "business" | null;
  subscriptionEnds: Date | null;
  priceId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
}

// Define the type for upload stats based on getUserUploadStats
interface UploadStats {
  monthlyUploads: number;
  monthlyUrlUploads: number;
  lastReset: Date | null;
}

export default function BillingDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user subscription data with explicit type
  const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery(
    undefined,
    { enabled: true }
  ) as { data: SubscriptionData | undefined; isLoading: boolean };

  // Fetch user upload stats with explicit type
  const { data: uploadStats } = trpc.getUserUploadStats.useQuery(
    undefined,
    { enabled: true }
  ) as { data: UploadStats | undefined };

  // Redirect to pricing page if user has no subscription
  useEffect(() => {
    if (subscription && !subscription.isSubscribed) {
      router.push("/#pricing");
    }
  }, [subscription, router]);

  // Function to manage subscription (go to customer portal)
  const manageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/manage-subscription", {
        subscriptionId: subscription?.subscriptionId,
      });
      window.open(response.data.portalUrl, "_self");
    } catch (error) {
      toast.error("Failed to open customer portal. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to upgrade subscription
  const upgradeSubscription = () => {
    router.push("/#pricing");
  };

  // If loading, show loading indicator
  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If no subscription, don't render the content (will be redirected)
  if (!subscription?.isSubscribed) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Current Plan Section */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{subscription.plan}</h3>
              <p className="text-gray-500 text-sm">Active subscription</p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex gap-2 items-center text-gray-600">
              <CalendarClock className="h-5 w-5" />
              <span>
                Renews on{" "}
                {subscription.subscriptionEnds
                  ? new Date(subscription.subscriptionEnds).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>

            <button
              onClick={manageSubscription}
              disabled={isLoading}
              className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Manage Billing Details
            </button>
          </div>

          {subscription?.planType !== "business" && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-medium mb-2">Want more features?</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to our Business plan for unlimited PDFs, more pages, and premium support.
              </p>
              <button
                onClick={upgradeSubscription}
                className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800"
              >
                <CircleFadingArrowUp className="h-4 w-4" />
                Upgrade Plan
              </button>
            </div>
          )}
        </div>

        {/* Plan Features Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4">Plan Features</h2>

          {subscription?.planType === "pro" && (
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>20 PDFs per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>50 Pages per PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>50 Web Pages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Instant AI Chat</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>24/7 Email Support</span>
              </li>
            </ul>
          )}

          {subscription?.planType === "business" && (
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Unlimited PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>2000 Pages per PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Unlimited Web Pages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Enhanced AI Accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Priority 24/7 Support</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Usage Statistics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">PDFs Uploaded</h3>
            <p className="text-2xl font-semibold">
              {uploadStats?.monthlyUploads || 0}
              <span className="text-sm text-gray-500 font-normal">
                /{subscription?.planType === "business" ? "Unlimited" : "20"}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">Web Pages</h3>
            <p className="text-2xl font-semibold">
              {uploadStats?.monthlyUrlUploads || 0}
              <span className="text-sm text-gray-500 font-normal">
                /{subscription?.planType === "business" ? "Unlimited" : "50"}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">Billing Cycle</h3>
            <p className="text-lg font-medium">
              {subscription?.subscriptionEnds
                ? `Renews ${new Date(subscription.subscriptionEnds).toLocaleDateString()}`
                : "Active subscription"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}