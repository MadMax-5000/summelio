"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ThankYou() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the dashboard after 5 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Thank You for Your Purchase!</h1>
            <p className="text-lg">
                Your subscription was successful. You will be redirected to your dashboard shortly.
            </p>
        </div>
    );
}
