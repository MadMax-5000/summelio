import { redirect } from "next/navigation";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest } from "next/server";

export default async function InitiateCheckout({ searchParams }: { searchParams: { productId?: string } }) {
    const { userId } = getAuth({} as NextRequest); // App Router doesn’t pass req directly, but getAuth works with headers

    if (!userId) {
        redirect("/sign-in");
    }

    const productId = searchParams.productId;
    if (!productId) {
        redirect("/");
    }

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_URL}/api/subscribe`,
            { productId, userId },
            { headers: { "Content-Type": "application/json" } }
        );

        const checkoutUrl = response.data.checkoutUrl;
        redirect(checkoutUrl);
    } catch (error) {
        console.error("Checkout initiation error:", error);
        redirect("/error");
    }
}