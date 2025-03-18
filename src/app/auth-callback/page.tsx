"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect } from "react";
import { Toaster, toast } from "sonner";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const utils = trpc.useContext();

  const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: async ({ success }) => {
      if (success) {
        const subscription = await utils.getUserSubscription.fetch();
        if (!subscription.isSubscribed) {
          toast.error("You need to purchase a subscription to continue.");
          setTimeout(() => router.push("/#pricing"), 3000); // Delay for animation
        } else if (origin) {
          toast.message("You will be redirected soon.");
          setTimeout(() => router.push(`/${origin}`), 3000); // Delay for animation
        } else {
          toast.message("Redirecting to your dashboard...");
          setTimeout(() => router.push("/dashboard"), 3000); // Delay for animation
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

  return (
    <div className="w-full mt-24 flex justify-center">
      <Toaster position="top-center" />
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
