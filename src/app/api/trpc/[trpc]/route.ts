import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc";
import { auth } from "@clerk/nextjs/server";

const createContext = async () => {
  const { userId } = await auth();
  return { userId };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
export type Context = Awaited<ReturnType<typeof createContext>>;
