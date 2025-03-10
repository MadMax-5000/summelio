import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import BillingDashboard from "@/components/BillingDashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";


export default async function BillingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return (
  <SidebarProvider>
    <AppSidebar/>
  <BillingDashboard />
  </SidebarProvider>)
} 