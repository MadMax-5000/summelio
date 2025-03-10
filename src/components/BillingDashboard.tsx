"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2, CheckCircle, AlertCircle, CreditCard, CalendarClock, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function BillingDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch user subscription data
  const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery();
  
  // Function to manage subscription (go to customer portal)
  const manageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/manage-subscription", {
        subscriptionId: subscription?.subscriptionId
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
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      
      {isLoadingSubscription ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Current Plan Section */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${subscription?.isSubscribed ? "bg-green-100" : "bg-amber-100"}`}>
                {subscription?.isSubscribed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">{subscription?.plan || "Free Plan"}</h3>
                <p className="text-gray-500 text-sm">
                  {subscription?.isSubscribed ? "Active subscription" : "No active subscription"}
                </p>
              </div>
            </div>
            
            {subscription?.isSubscribed && (
              <div className="space-y-4 mt-6">
                <div className="flex gap-2 items-center text-gray-600">
                  <CalendarClock className="h-5 w-5" />
                  <span>
                    Renews on {subscription.subscriptionEnds 
                      ? new Date(subscription.subscriptionEnds).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
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
            )}
            
            {!subscription?.isSubscribed && (
              <div className="mt-6">
                <p className="text-gray-600 mb-4">
                  Upgrade your account to access premium features and increase your limits.
                </p>
                <button
                  onClick={upgradeSubscription}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md"
                >
                  View Plans
                </button>
              </div>
            )}
            
            {subscription?.isSubscribed && subscription?.planType !== "business" && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-medium mb-2">Want more features?</h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to our Business plan for unlimited PDFs, more pages, and premium support.
                </p>
                <button
                  onClick={upgradeSubscription}
                  className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800"
                >
                  <RefreshCcw className="h-4 w-4" />
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
            
            {!subscription?.isSubscribed && (
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Limited PDF uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Basic features only</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Standard support</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Usage Statistics (optional) */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Usage Statistics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">PDFs Uploaded</h3>
            <p className="text-2xl font-semibold">
              {/* This would need to be fetched from your backend */}
              12 <span className="text-sm text-gray-500 font-normal">/ {subscription?.planType === "business" ? "∞" : "20"}</span>
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">Web Pages</h3>
            <p className="text-2xl font-semibold">
              {/* This would need to be fetched from your backend */}
              8 <span className="text-sm text-gray-500 font-normal">/ {subscription?.planType === "business" ? "∞" : "50"}</span>
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-sm mb-1">Billing Cycle</h3>
            <p className="text-lg font-medium">
              {subscription?.subscriptionEnds 
                ? `Renews ${new Date(subscription.subscriptionEnds).toLocaleDateString()}`
                : "No active subscription"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 