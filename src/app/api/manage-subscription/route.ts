import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { lemonSqueezyApiInstance } from "@/utils/axios";

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Get subscription details from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        lemonSqueezyCustomerId: true,
        lemonSqueezySubscriptionId: true,
      },
    });
    
    if (!user || !user.lemonSqueezySubscriptionId) {
      return Response.json({ message: "No subscription found" }, { status: 404 });
    }
    
    // Create a customer portal link using Lemon Squeezy API
    const response = await lemonSqueezyApiInstance.post("/customer-portal", {
      data: {
        type: "customer-portals",
        attributes: {
          customer_id: user.lemonSqueezyCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        },
      },
    });
    
    const portalUrl = response.data.data.attributes.url;
    
    return Response.json({ portalUrl });
  } catch (error) {
    console.error("Error creating customer portal link:", error);
    return Response.json(
      { message: "Failed to create portal link" },
      { status: 500 }
    );
  }
} 