import crypto from "crypto";
import { db } from "@/db";

export async function POST(req: Request) {
  try {
    // Clone the request to use its stream twice
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    
    // Read the raw body text for signature verification
    const rawBody = await clonedReq.text();
    // Parse the JSON after using the raw text for verification
    const body = JSON.parse(rawBody);

    // Verify the webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE as string;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }

    console.log("Webhook received:", eventType);
    
    if (eventType === "subscription_created") {
      // Get userId from the webhook custom_data
      const userId = body.meta.custom_data?.user_id;
      
      if (!userId) {
        console.error("No user_id found in webhook custom_data");
        return Response.json({ message: "No user_id in custom_data" }, { status: 400 });
      }
      
      const subscriptionId = body.data.id; 
      const customerId = body.data.attributes.customer_id; 
      const renewsAt = body.data.attributes.renews_at; 
      const variantId = body.data.attributes.variant_id;

      console.log(`Updating user ${userId} with subscription ${subscriptionId}`);
      
      await db.user.update({
        where: { id: userId },
        data: {
          lemonSqueezySubscriptionId: subscriptionId,
          lemonSqueezyCustomerId: customerId.toString(),
          lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
          lemonSqueezyPriceId: variantId.toString(),
        },
      });
    } else if (eventType === "subscription_updated") {
      // Get subscription details from the webhook data
      const subscriptionId = body.data.id;
      const renewsAt = body.data.attributes.renews_at;
      const variantId = body.data.attributes.variant_id;
      
      console.log(`Updating subscription ${subscriptionId} details`);
      
      // Update user record with new subscription details
      await db.user.update({
        where: { lemonSqueezySubscriptionId: subscriptionId },
        data: {
          lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
          lemonSqueezyPriceId: variantId.toString(),
        },
      });
    } else if (eventType === "subscription_cancelled") {
      // Get subscription ID from the webhook data
      const subscriptionId = body.data.id;
      
      console.log(`Cancelling subscription ${subscriptionId}`);
      
      await db.user.update({
        where: { lemonSqueezySubscriptionId: subscriptionId },
        data: {
          // When subscription is cancelled, retain the ID but set end date to now
          // This will cause isSubscribed check to return false in our queries
          lemonSqueezyCurrentPeriodEnd: new Date(),
        },
      });
    }

    return Response.json({ message: "Webhook received" });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
