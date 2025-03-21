import crypto from "crypto";
import { db } from "@/db";

export async function POST(req: Request) {
  try {
    console.log("[Webhook] Received a request");

    // Clone the request to use its stream twice
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    console.log(`[Webhook] Event type: ${eventType}`);

    // Read the raw body text for signature verification
    const rawBody = await clonedReq.text();
    if (!rawBody) {
      console.log("[Webhook] Empty request body received");
      return Response.json({ message: "Invalid or empty request body" }, { status: 400 });
    }
    console.log("[Webhook] Raw body received");

    // Parse the JSON after using the raw text for verification
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("[Webhook] Parsed JSON body:", body);
    } catch (jsonError) {
      console.log("[Webhook] JSON parse error:", jsonError);
      return Response.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // Skip signature verification during development
    if (process.env.NODE_ENV === "development") {
      console.log("[Webhook] Development mode: Skipping signature verification");
    } else {
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
        console.log("[Webhook] Signature verification error:", signatureError);
        return Response.json({ message: "Error verifying signature" }, { status: 401 });
      }
    }

    console.log(`[Webhook] ${eventType} event received`);

    if (eventType === "subscription_created") {
      const userId = body.meta?.custom_data?.user_id;
      const subscriptionId = body.data?.id.toString();
      const customerId = body.data?.attributes?.customer_id.toString();
      const renewsAt = body.data?.attributes?.renews_at;
      const variantId = body.data?.attributes?.variant_id.toString();

      console.log("[Webhook] subscription_created event data:", {
        userId,
        subscriptionId,
        customerId,
        renewsAt,
        variantId,
      });

      if (!userId || !subscriptionId || !customerId || !renewsAt || !variantId) {
        console.log("[Webhook] Missing required subscription data");
        return Response.json({ message: "Missing required subscription data" }, { status: 400 });
      }

      try {
        const existingUser = await db.user.findFirst({
          where: { lemonSqueezyCustomerId: customerId },
        });

        console.log("[Webhook] Existing user check result:", existingUser);

        if (existingUser) {
          console.log(`[Webhook] Updating existing subscription for customer ${customerId}`);
          await db.user.update({
            where: { lemonSqueezyCustomerId: customerId },
            data: {
              lemonSqueezySubscriptionId: subscriptionId,
              lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
              lemonSqueezyPriceId: variantId,
            },
          });
        } else {
          console.log(`[Webhook] Creating new subscription record for user ${userId}`);
          await db.user.update({
            where: { id: userId },
            data: {
              lemonSqueezySubscriptionId: subscriptionId,
              lemonSqueezyCustomerId: customerId,
              lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
              lemonSqueezyPriceId: variantId,
            },
          });
        }
        console.log(`[Webhook] Subscription ${subscriptionId} processed successfully`);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_created:", dbError);
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    } else if (eventType === "subscription_updated") {
      const subscriptionId = body.data?.id.toString();
      const renewsAt = body.data?.attributes?.renews_at;
      const variantId = body.data?.attributes?.variant_id.toString();

      console.log("[Webhook] subscription_updated event data:", {
        subscriptionId,
        renewsAt,
        variantId,
      });

      if (!subscriptionId || !renewsAt || !variantId) {
        console.log("[Webhook] Missing required subscription update data");
        return Response.json({ message: "Missing required data" }, { status: 400 });
      }

      try {
        // Check if user exists before attempting update
        const userExists = await db.user.findUnique({
          where: { lemonSqueezySubscriptionId: subscriptionId }
        });

        console.log(`[Webhook] Found user to update:`, !!userExists);

        if (!userExists) {
          console.log(`[Webhook] No user found with subscription ID ${subscriptionId}. Searching by user_id instead.`);

          // Try to find user by the user_id in custom_data if available
          const userId = body.meta?.custom_data?.user_id;
          if (userId) {
            const userByCustomId = await db.user.findUnique({
              where: { id: userId }
            });

            if (userByCustomId) {
              console.log(`[Webhook] Found user by user_id: ${userId}. Updating subscription information.`);
              const updateResult = await db.user.update({
                where: { id: userId },
                data: {
                  lemonSqueezySubscriptionId: subscriptionId,
                  lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
                  lemonSqueezyPriceId: variantId,
                },
              });
              console.log(`[Webhook] User updated via user_id successfully:`, updateResult);
              return Response.json({ message: "Webhook processed successfully" });
            }
          }

          console.log(`[Webhook] Could not find a user to update`);
          return Response.json({ message: "User not found" }, { status: 404 });
        }

        const updateResult = await db.user.update({
          where: { lemonSqueezySubscriptionId: subscriptionId },
          data: {
            lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
            lemonSqueezyPriceId: variantId,
          },
        });

        console.log(`[Webhook] Subscription ${subscriptionId} updated successfully:`, updateResult);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_updated:", dbError);
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    } else if (eventType === "subscription_cancelled") {
      const subscriptionId = body.data?.id.toString();

      console.log("[Webhook] subscription_cancelled event data:", {
        subscriptionId,
      });

      if (!subscriptionId) {
        console.log("[Webhook] Missing subscription ID in cancellation");
        return Response.json({ message: "Missing subscription ID" }, { status: 400 });
      }

      try {
        // Check if user exists before attempting update
        const userExists = await db.user.findUnique({
          where: { lemonSqueezySubscriptionId: subscriptionId }
        });

        console.log(`[Webhook] Found user to cancel:`, !!userExists);

        if (!userExists) {
          console.log(`[Webhook] No user found with subscription ID ${subscriptionId}`);
          return Response.json({ message: "User not found" }, { status: 404 });
        }

        const updateResult = await db.user.update({
          where: { lemonSqueezySubscriptionId: subscriptionId },
          data: {
            lemonSqueezyCurrentPeriodEnd: new Date(),
          },
        });

        console.log(`[Webhook] Subscription ${subscriptionId} cancelled successfully:`, updateResult);
      } catch (dbError) {
        console.log("[Webhook] Database error in subscription_cancelled:", dbError);
        return Response.json({ message: "Database error" }, { status: 500 });
      }
    }

    return Response.json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.log("[Webhook] Unexpected error occurred:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}