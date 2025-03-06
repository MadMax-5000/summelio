import { PLANS } from "@/config/lemonsqueezy";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { LemonSqueezyClient } from "@lemonsqueezy/lemonsqueezy.js";

const lemonSqueezy = new LemonSqueezyClient(process.env.LEMONSQUEEZY_API_KEY);

export async function getUserSubscriptionPlan() {
  const user = await currentUser();

  if (!user || !user.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      subscriptionEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      subscriptionEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.lemonSqueezySubscriptionId &&
      dbUser.subscriptionEnd &&
      new Date(dbUser.subscriptionEnd).getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find(
        (plan) => plan.price.priceIds.test === dbUser.lemonSqueezyPriceId
      )
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.lemonSqueezySubscriptionId) {
    const subscription = await lemonSqueezy.subscriptions.retrieve(
      dbUser.lemonSqueezySubscriptionId
    );
    isCanceled = subscription.data.attributes.cancelled;
  }

  return {
    ...plan,
    subscriptionId: dbUser.lemonSqueezySubscriptionId,
    subscriptionEnd: dbUser.subscriptionEnd,
    customerId: dbUser.lemonSqueezyCustomerId,
    isSubscribed,
    isCanceled,
  };
}
