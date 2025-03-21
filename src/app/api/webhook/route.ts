import crypto from "crypto";
import { db } from "@/db"; // Assuming Prisma or similar DB client

export async function POST(req: Request) {
  try {
    console.log("[Webhook] Received a request");

    // Read the raw body text for signature verification
    const rawBody = await req.text();
    if (!rawBody) {
      console.error("[Webhook] Empty request body received");
      return new Response("Invalid or empty request body", { status: 400 });
    }

    const eventType = req.headers.get("X-Event-Name");
    console.log(`[Webhook] Event type: ${eventType}`);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("[Webhook] Parsed JSON body:", body);
    } catch (err) {
      console.error("[Webhook] JSON parse error:", err);
      return new Response("Invalid JSON body", { status: 400 });
    }

    // Signature verification (skip in development)
    if (process.env.NODE_ENV !== "development") {
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE;
      if (!secret) {
        console.error("[Webhook] Missing webhook signature secret");
        return new Response("Server configuration error", { status: 500 });
      }

      const signatureHeader = req.headers.get("X-Signature");
      if (!signatureHeader) {
        console.error("[Webhook] Missing signature header");
        return new Response("Missing signature header", { status: 400 });
      }

      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(rawBody).digest();
      const signature = Buffer.from(signatureHeader, "hex");

      if (!crypto.timingSafeEqual(digest, signature)) {
        console.error("[Webhook] Invalid signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    // Handle different event types
    switch (eventType) {
      case "subscription_created":
        await handleSubscriptionCreated(body);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(body);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(body);
        break;

      default:
        console.warn(`[Webhook] Unsupported event type: ${eventType}`);
        return new Response("Event type not supported", { status: 400 });
    }

    return new Response("Webhook processed successfully");
  } catch (err) {
    console.error("[Webhook] Unexpected error occurred:", err);
    return new Response("Server error", { status: 500 });
  }
}

// Handler for subscription_created event
async function handleSubscriptionCreated(body: any) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: {
      id: subscriptionId,
      attributes: { customer_id: customerId, renews_at: renewsAt, variant_id: variantId } = {},
    } = {},
  } = body;

  if (!userId || !subscriptionId || !customerId || !variantId) {
    console.error("[Webhook] Missing required subscription data:", { userId, subscriptionId, customerId, variantId });
    throw new Error("Missing required subscription data");
  }

  const existingUser = await db.user.findUnique({ where: { id: userId } });

  if (existingUser) {
    try {
      // Check if another user already has the same customerId
      const conflictingUser = await db.user.findUnique({
        where: { lemonSqueezyCustomerId: String(customerId) },
      });

      if (conflictingUser && conflictingUser.id !== userId) {
        console.error(
          `[Webhook] Conflict: Customer ID ${customerId} is already associated with another user (${conflictingUser.id})`
        );
        throw new Error("Customer ID conflict");
      }

      await db.user.update({
        where: { id: userId },
        data: {
          lemonSqueezySubscriptionId: String(subscriptionId),
          lemonSqueezyCustomerId: String(customerId),
          lemonSqueezyPriceId: String(variantId),
          lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
        },
      });
      console.log(`[Webhook] Updated user ${userId} with subscription ${subscriptionId}`);
    } catch (error) {
      console.error(`[Webhook] Update failed: ${(error as Error).message}`);
      throw error;
    }
  } else {
    console.error(`[Webhook] User ${userId} not found`);
    throw new Error("User not found");
  }
}

// Handler for subscription_updated event
async function handleSubscriptionUpdated(body: any) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: {
      id: subscriptionId,
      attributes: { customer_id: customerId, renews_at: renewsAt, variant_id: variantId } = {},
    } = {},
  } = body;

  if (!userId || !subscriptionId || !customerId || !variantId) {
    console.error("[Webhook] Missing required subscription update data:", { userId, subscriptionId, customerId, variantId });
    throw new Error("Missing required subscription update data");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`[Webhook] User ${userId} not found for update`);
    throw new Error("User not found");
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        lemonSqueezySubscriptionId: String(subscriptionId),
        lemonSqueezyCustomerId: String(customerId),
        lemonSqueezyPriceId: String(variantId),
        lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
      },
    });
    console.log(`[Webhook] Updated subscription ${subscriptionId} for user ${userId}`);
  } catch (error) {
    console.error(`[Webhook] Update failed: ${(error as Error).message}`);
    throw error;
  }
}

// Handler for subscription_cancelled event
async function handleSubscriptionCancelled(body: any) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: { id: subscriptionId } = {},
  } = body;

  if (!userId || !subscriptionId) {
    console.error("[Webhook] Missing required subscription cancellation data:", { userId, subscriptionId });
    throw new Error("Missing required subscription cancellation data");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`[Webhook] User ${userId} not found for cancellation`);
    throw new Error("User not found");
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        lemonSqueezySubscriptionId: null, // Or set to a cancelled state
        lemonSqueezyCurrentPeriodEnd: new Date(), // Optionally set to current time
      },
    });
    console.log(`[Webhook] Cancelled subscription ${subscriptionId} for user ${userId}`);
  } catch (error) {
    console.error(`[Webhook] Cancellation update failed: ${(error as Error).message}`);
    throw error;
  }
}
