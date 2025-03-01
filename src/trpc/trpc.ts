// src/trpc/trpc.ts
import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "@/app/api/trpc/[trpc]/route"; // Import the Context type (adjust path as needed)

const t = initTRPC.context<Context>().create(); // Tell TRPC to use the Context type
const middleware = t.middleware;

const isAuth = middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
