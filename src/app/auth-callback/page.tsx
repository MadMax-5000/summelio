"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/_trpc/client";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const utils = trpc.useContext();

  // Use TRPC to check auth status
  const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: async ({ success }) => {
      if (success) {
        // Use the TRPC context to fetch the subscription status
        const subscription = await utils.getUserSubscription.fetch();
        if (!subscription.isSubscribed) {
          router.push("/#pricing");
        } else if (origin) {
          router.push(`/${origin}`);
        } else {
          router.push("/dashboard");
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
