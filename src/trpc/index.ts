import { router, publicProcedure, privateProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    const user = await currentUser();
    if (!user || !user.id || user.emailAddresses.length === 0) {
      return { success: false, reason: "User not authenticated" };
    }
    const userId = user.id;
    const email = user.emailAddresses[0].emailAddress;
    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log("Created new user in database:", userId);
    }
    return { success: true };
  }),
  // creating a new API endpoint
  // we pass in a user ID and we get all the files he has
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }
      return {
        messages,
        nextCursor,
      };
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });
      if (!file) return { status: "PENDING" as const };
      return { status: file.uploadStatus };
    }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      return file;
    }),

  deleteFile: privateProcedure
    .input(
      z.object({
        // checking type safety during runtime
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
        },
      });
      return file;
    }),

    saveUrlAsFile: privateProcedure
    .input(
      z.object({
        url: z.string().url(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
  
      // Get user subscription status
      const user = await db.user.findUnique({
        where: { id: userId as string },
        select: {
          monthlyUrlUploads: true,
          lemonSqueezyPriceId: true,
          lemonSqueezyCurrentPeriodEnd: true,
        },
      });
  
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
  
      // Check subscription status
      const hasActiveSubscription = user.lemonSqueezyCurrentPeriodEnd 
        ? new Date(user.lemonSqueezyCurrentPeriodEnd) > new Date() 
        : false;
  
      if (!hasActiveSubscription) {
        throw new TRPCError({ 
          code: "FORBIDDEN",
          message: "Please subscribe to upload web pages"
        });
      }
  
      // Determine upload limit based on plan
      const uploadLimit = user.lemonSqueezyPriceId === "716134" // Business plan
      ? 1000 
      : 50; // Pro plan default
  
      // Check if user has reached their limit
      if (user.monthlyUrlUploads >= uploadLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Monthly web page upload limit (${uploadLimit}) reached`
        });
      }
  
      // Parse the URL
      const urlObj = new URL(input.url);
      const hostname = urlObj.hostname;
       
      // Detect URL type
      let fileType = "Web Page"; // Default type for non-YouTube URLs
      const nameURL = input.name || hostname;
      
      // YouTube URL detection patterns
      const youtubePatterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+/,
        /^(https?:\/\/)?(www\.)?youtu\.be\/.+/
      ];
      
      // Check if URL is a YouTube link
      if (youtubePatterns.some(pattern => pattern.test(input.url))) {
        fileType = "Youtube Video";
      }
  
      // Generate unique key
      const uniqueKey = `url-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
      // Increment the URL upload counter
      await db.user.update({
        where: { id: userId as string },
        data: {
          monthlyUrlUploads: {
            increment: 1
          }
        }
      });
  
      // Create the file record with explicit type
      const urlFile = await db.file.create({
        data: {
          key: uniqueKey,
          name: nameURL,
          userId: userId,
          url: input.url,
          uploadStatus: "PROCESSING",
          type: fileType, // Explicitly set to "Youtube Video" or "Web Page"
        },
      });
  
      return urlFile;
    }),
  getUserSubscription: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    
    const user = await db.user.findUnique({
      where: { id: userId ?? undefined},
      select: {
        lemonSqueezyCustomerId: true,
        lemonSqueezySubscriptionId: true,
        lemonSqueezyPriceId: true,
        lemonSqueezyCurrentPeriodEnd: true,
      },
    });
    
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    
    const hasActiveSubscription = user.lemonSqueezyCurrentPeriodEnd 
      ? new Date(user.lemonSqueezyCurrentPeriodEnd) > new Date() 
      : false;
      
    const planMap: Record<string, {name: string, type: "pro" | "business"}> = {
      "716126": {name: "Pro Plan", type: "pro"},
      "716134": {name: "Business Plan", type: "business"},
    };
    
    const planInfo = user.lemonSqueezyPriceId ? planMap[user.lemonSqueezyPriceId] : null;
    
    return {
      isSubscribed: hasActiveSubscription,
      plan: hasActiveSubscription && planInfo ? planInfo.name : "Free",
      planType: hasActiveSubscription && planInfo ? planInfo.type : null,
      subscriptionEnds: user.lemonSqueezyCurrentPeriodEnd,
      priceId: user.lemonSqueezyPriceId,
      subscriptionId: user.lemonSqueezySubscriptionId,
      customerId: user.lemonSqueezyCustomerId,
    };
  }),
  getUserUploadStats: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    
    const user = await db.user.findUnique({
      where: { id: userId ?? undefined },
      select: {
        monthlyPdfUploads: true,
        monthlyUrlUploads: true,
        lastUploadReset: true,
      },
    });
    
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    
    return {
      monthlyUploads: user.monthlyPdfUploads,
      monthlyUrlUploads: user.monthlyUrlUploads,
      lastReset: user.lastUploadReset,
    };
  }),
});

export type appRouter = typeof appRouter;
