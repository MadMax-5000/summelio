import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

const clerkMW = clerkMiddleware();

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  // Let Clerk handle session management
  const response = await clerkMW(req, event);

  // Return the response from Clerk (or a default NextResponse)
  return response instanceof NextResponse ? response : NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (unless search params are present)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
