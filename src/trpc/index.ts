import { router, publicProcedure, privateProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    const user = await currentUser();
    console.log("Current user in authCallback:", user);
    if (!user || !user.id || user.emailAddresses.length === 0) {
      console.log("User authentication failed - redirecting to sign-in");
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
        url: z.string().url(), // validate if it is a URL
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      // generate a unique key for the URL
      const uniqueKey = `url-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Determine a name for the url if not provided
      const name = input.name || new URL(input.url).hostname;

      // create a file record for the URL
      const urlFile = await db.file.create({
        data: {
          key: uniqueKey,
          name: name,
          userId: userId,
          url: input.url,
          uploadStatus: "PROCESSING",
          type: "URL",
        },
      });
      return urlFile;
    }),
});

export type appRouter = typeof appRouter;

// this is updated for clerk
