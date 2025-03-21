"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const utils = trpc.useContext();

  // State to determine if the user has a subscription:
  // null: not determined yet, false: no subscription, true: has subscription.
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  const { error, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: async ({ success }) => {
      if (success) {
        const subscription = await utils.getUserSubscription.fetch();
        if (!subscription.isSubscribed) {
          setHasSubscription(false);
          toast.error("You need to purchase a subscription to continue.");
          // Optionally, you can keep the toast and allow manual redirection via a button.
        } else {
          setHasSubscription(true);
          if (origin) {
            toast.message("You will be redirected soon.");
            setTimeout(() => router.push(`/${origin}`), 3000);
          } else {
            toast.message("Redirecting to your dashboard...");
            setTimeout(() => router.push("/dashboard"), 3000);
          }
        }
      }
    },
    onError: (err) => {
      console.error("Auth callback error:", err);
      if (err.data?.code === "UNAUTHORIZED") {
        toast.error("You are not authorized. Please sign in.");
        setTimeout(() => router.push("/sign-in"), 3000);
      }
    },
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (isLoading) {
      toast.message("Checking your account...");
    }
  }, [isLoading]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render a dedicated UI if the user is not subscribed.
  if (hasSubscription === false) {
    return (
      <div className="w-full mt-24 flex flex-col items-center">
        <Toaster position="bottom-right" />
        <h3 className="font-semibold text-3xl mb-4">Subscription Required</h3>
        <p className="text-lg text-zinc-600 mb-4">
          You need to purchase a subscription to continue.
        </p>
        <button
          onClick={() => router.push("/#pricing")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Go to Pricing
        </button>
      </div>
    );
  }

  // If the user is subscribed or the status is not yet determined, show the account setup text.
  return (
    <div className="w-full mt-24 flex justify-center">
      <Toaster position="bottom-right" />
      <div className="flex flex-col items-center gap-2 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p className="text-sm text-zinc-600">You will be redirected soon.</p>
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
