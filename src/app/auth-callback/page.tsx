"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: async ({ success }) => {
      if (success) {
        // Check user subscription status after authentication
        try {
          const subscriptionResponse = await fetch('/api/check-subscription-status');
          const subscriptionData = await subscriptionResponse.json();

          if (!subscriptionData.isSubscribed) {
            // If no active subscription, redirect to pricing section
            router.push("/#pricing");
          } else if (origin) {
            // If there's an origin, redirect there
            router.push(`/${origin}`);
          } else {
            // Otherwise go to dashboard
            router.push("/dashboard");
          }
        } catch (err) {
          // If subscription check fails, redirect to pricing to be safe
          router.push("/#pricing");
        }
      }
    },
    onError: (err) => {
      console.error("Auth callback error:", err);
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthCallback />
  </Suspense>
);

export default Page;