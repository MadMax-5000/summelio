import { redirect } from "next/navigation";
import { getAuth } from "@clerk/nextjs/server";
import { lemonSqueezyApiInstance } from "@/utils/axios";
import { db } from "@/db";
import { NextRequest } from "next/server";

export default async function ThankYouPage({ searchParams }: { searchParams: { subscription_id?: string } }) {
    const { userId } = getAuth({} as NextRequest);

    if (!userId) {
        redirect("/sign-in");
    }

    const subscriptionId = searchParams.subscription_id;
    if (!subscriptionId) {
        redirect("/");
    }

    try {
        const response = await lemonSqueezyApiInstance.get(`/subscriptions/${subscriptionId}`);
        const subscription = response.data.data;

        const customData = subscription.attributes.custom_data;
        const subscriptionUserId = customData?.user_id;

        if (subscriptionUserId !== userId) {
            throw new Error("User ID mismatch");
        }

        await db.user.update({
            where: { id: userId },
            data: {
                lemonSqueezySubscriptionId: subscription.id,
                lemonSqueezyCustomerId: subscription.attributes.customer_id.toString(),
                lemonSqueezyCurrentPeriodEnd: new Date(subscription.attributes.renews_at),
                lemonSqueezyPriceId: subscription.attributes.variant_id.toString(),
            },
        });

        redirect("/dashboard");
    } catch (error) {
        console.error("Thank-you processing error:", error);
        redirect("/error");
    }
}