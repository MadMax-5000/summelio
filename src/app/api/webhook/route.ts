import crypto from "crypto";
import { db } from "@/db";

export async function POST(req: Request) {
  try {
    // Clone the request to use its stream twice
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    
    // Read the raw body text for signature verification
    const rawBody = await clonedReq.text();
    if (!rawBody) {
      console.log("[Webhook] Empty request body received");
      return Response.json({ message: "Invalid or empty request body" }, { status: 400 });
    }
    
    // Parse the JSON after using the raw text for verification
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (jsonError) {
      console.log("[Webhook] JSON parse error");
      return Response.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // Skip signature verification during development
    if (process.env.NODE_ENV === "development") {
      console.log("[Webhook] Development mode: Skipping signature verification");
    } else {
      // Verify the webhook signature
      try {
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE;
        if (!secret) {
          console.log("[Webhook] Missing webhook signature secret");
          return Response.json({ message: "Server configuration error" }, { status: 500 });
        }
        
        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(rawBody).digest();
        const signatureHeader = req.headers.get("X-Signature");
        
        if (!signatureHeader) {
          console.log("[Webhook] Missing signature header");
          return Response.json({ message: "Missing signature header" }, { status: 400 });
        }
        
        const signature = Buffer.from(signatureHeader, "hex");
        
        if (!crypto.timingSafeEqual(digest, signature)) {
          console.log("[Webhook] Invalid signature");
          return Response.json({ message: "Invalid signature" }, { status: 401 });
        }
      } catch (signatureError) {
        console.log("[Webhook] Signature verification error");
        return Response.json({ message: "Error verifying signature" }, { status: 401 });
      }
    }

    console.log(`[Webhook] ${eventType} event received`);
    
    if (eventType === "subscription_created") {
      try {
        // Get userId from the webhook custom_data
        const userId = body.meta?.custom_data?.user_id;
        
        if (!userId) {
          console.log("[Webhook] No user_id found in webhook custom_data");
          return Response.json({ message: "No user_id in custom_data" }, { status: 400 });
        }
        
        const subscriptionId = body.data?.id; 
        const customerId = body.data?.attributes?.customer_id; 
        const renewsAt = body.data?.attributes?.renews_at; 
        const variantId = body.data?.attributes?.variant_id;

        if (!subscriptionId || !customerId || !renewsAt || !variantId) {
          console.log("[Webhook] Missing required subscription data");
          return Response.json({ message: "Missing required subscription data" }, { status: 400 });
        }

        console.log(`[Webhook] Processing subscription ${subscriptionId} for user ${userId}`);
        
        // First check if a user already has this customer ID
        const existingUser = await db.user.findFirst({
          where: { lemonSqueezyCustomerId: customerId.toString() }
        });
        
        if (existingUser) {
          console.log(`[Webhook] Updating existing subscription for customer ${customerId}`);
          
          // Update the existing user with the new subscription
          await db.user.update({
            where: { lemonSqueezyCustomerId: customerId.toString() },
            data: {
              lemonSqueezySubscriptionId: subscriptionId,
              lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
              lemonSqueezyPriceId: variantId.toString(),
            },
          });
        } else {
          console.log(`[Webhook] Creating new subscription record for user ${userId}`);
          
          // No existing user with this customer ID, proceed with normal update
          await db.user.update({
            where: { id: userId },
            data: {
              lemonSqueezySubscriptionId: subscriptionId,
              lemonSqueezyCustomerId: customerId.toString(),
              lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
              lemonSqueezyPriceId: variantId.toString(),
            },
          });
        }
        
        console.log(`[Webhook] Subscription ${subscriptionId} processed successfully`);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_created");
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    } else if (eventType === "subscription_updated") {
      try {
        // Get subscription details from the webhook data
        const subscriptionId = body.data?.id;
        const renewsAt = body.data?.attributes?.renews_at;
        const variantId = body.data?.attributes?.variant_id;
        
        if (!subscriptionId || !renewsAt || !variantId) {
          console.log("[Webhook] Missing required subscription update data");
          return Response.json({ message: "Missing required data" }, { status: 400 });
        }
        
        console.log(`[Webhook] Updating subscription ${subscriptionId}`);
        
        // Update user record with new subscription details
        await db.user.update({
          where: { lemonSqueezySubscriptionId: subscriptionId },
          data: {
            lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
            lemonSqueezyPriceId: variantId.toString(),
          },
        });
        
        console.log(`[Webhook] Subscription ${subscriptionId} updated successfully`);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_updated");
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    } else if (eventType === "subscription_cancelled") {
      try {
        // Get subscription ID from the webhook data
        const subscriptionId = body.data?.id;
        
        if (!subscriptionId) {
          console.log("[Webhook] Missing subscription ID in cancellation");
          return Response.json({ message: "Missing subscription ID" }, { status: 400 });
        }
        
        console.log(`[Webhook] Cancelling subscription ${subscriptionId}`);
        
        await db.user.update({
          where: { lemonSqueezySubscriptionId: subscriptionId },
          data: {
            // When subscription is cancelled, retain the ID but set end date to now
            // This will cause isSubscribed check to return false in our queries
            lemonSqueezyCurrentPeriodEnd: new Date(),
          },
        });
        
        console.log(`[Webhook] Subscription ${subscriptionId} cancelled successfully`);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_cancelled");
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    }

    return Response.json({ message: "Webhook processed successfully" });
  } catch (err) {
    // Use String() to safely convert any error to string
    console.log("[Webhook] Unexpected error occurred");
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}