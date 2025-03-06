import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

const clerkMW = clerkMiddleware();

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  // Pass both 'req' and 'event' to the clerk middleware.
  const response = await clerkMW(req, event);

  // Ensure we have a NextResponse to work with for cookie operations.
  const nextResponse =
    response instanceof NextResponse ? response : NextResponse.next();

  // Custom cookie logic: set "sessionId" if it does not exist.
  if (!req.cookies.get("sessionId")) {
    nextResponse.cookies.set("sessionId", crypto.randomUUID());
  }

  return nextResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (unless search params are present)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
