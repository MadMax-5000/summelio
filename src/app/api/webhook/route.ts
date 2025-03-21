import crypto from "crypto";
import { db } from "@/db";

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

async function handleSubscriptionCreated(body) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: {
      id: subscriptionId,
      attributes: { customer_id: customerId, renews_at: renewsAt, variant_id: variantId } = {},
    } = {},
  } = body;

  if (!userId || !subscriptionId || !customerId || !renewsAt || !variantId) {
    console.error("[Webhook] Missing required subscription data");
    throw new Error("Missing required subscription data");
  }

  const existingUser = await db.user.findUnique({ where: { id: userId } });

  if (existingUser) {
    console.log(`[Webhook] Updating subscription for user ${userId}`);
    await db.user.update({
      where: { id: userId },
      data: {
        lemonSqueezySubscriptionId: subscriptionId,
        lemonSqueezyCustomerId: customerId,
        lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
        lemonSqueezyPriceId: variantId,
      },
    });
  } else {
    const customerUser = await db.user.findFirst({ where: { lemonSqueezyCustomerId: customerId } });

    if (customerUser) {
      console.warn(
        `[Webhook] User ID ${userId} not found, but customer ID ${customerId} exists. Updating customer.`
      );
      await db.user.update({
        where: { lemonSqueezyCustomerId: customerId },
        data: {
          lemonSqueezySubscriptionId: subscriptionId,
          lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
          lemonSqueezyPriceId: variantId,
        },
      });
    } else {
      console.error(`[Webhook] User ${userId} not found in database`);
      throw new Error("User not found");
    }
  }

  console.log(`[Webhook] Subscription ${subscriptionId} processed successfully`);
}

async function handleSubscriptionUpdated(body) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: {
      id: subscriptionId,
      attributes: { renews_at: renewsAt, variant_id: variantId } = {},
    } = {},
  } = body;

  if (!subscriptionId || !renewsAt || !variantId) {
    console.error("[Webhook] Missing required subscription update data");
    throw new Error("Missing required data");
  }

  const user = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : await db.user.findUnique({ where: { lemonSqueezySubscriptionId: subscriptionId } });

  if (!user) {
    console.error(`[Webhook] No user found with subscription ID ${subscriptionId}`);
    throw new Error("User not found");
  }

  console.log(`[Webhook] Updating subscription ${subscriptionId}`);
  await db.user.update({
    where: { lemonSqueezySubscriptionId: subscriptionId },
    data: {
      lemonSqueezyCurrentPeriodEnd: new Date(renewsAt),
      lemonSqueezyPriceId: variantId,
    },
  });
}

async function handleSubscriptionCancelled(body) {
  const {
    meta: { custom_data: { user_id: userId } = {} } = {},
    data: { id: subscriptionId } = {},
  } = body;

  if (!subscriptionId) {
    console.error("[Webhook] Missing subscription ID in cancellation");
    throw new Error("Missing subscription ID");
  }

  const user = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : await db.user.findUnique({ where: { lemonSqueezySubscriptionId: subscriptionId } });

  if (!user) {
    console.error(`[Webhook] No user found with subscription ID ${subscriptionId}`);
    throw new Error("User not found");
  }

  console.log(`[Webhook] Cancelling subscription ${subscriptionId}`);
  await db.user.update({
    where: { lemonSqueezySubscriptionId: subscriptionId },
    data: {
      lemonSqueezyCurrentPeriodEnd: new Date(),
    },
  });
}
