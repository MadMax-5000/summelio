import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return <Dashboard />;
};

export default Page;
