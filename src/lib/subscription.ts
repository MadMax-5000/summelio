import { db } from "@/db";

export async function checkSubscription(userId: string) {
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) return false;

  const isValid =
    user.lemonSqueezyCurrentPeriodEnd &&
    user.lemonSqueezyCurrentPeriodEnd.getTime() > Date.now();

  return !!isValid;
} 