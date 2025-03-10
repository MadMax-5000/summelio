"use client";

import { useUser } from "@clerk/nextjs";
import {
  BookCheck,
  Home,
  ThumbsUp,
  FolderOpen,
  BellPlus,
  Settings,
  LogOut,
  User2,
  ChevronUp,
  CircleDollarSign,
  ChevronsUpDown,
  LogOutIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Skeleton from "react-loading-skeleton";
import { SignOutButton } from "@clerk/nextjs"; // Import SignOutButton
import Link from "next/link";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Feedback", url: "#", icon: ThumbsUp },
  { title: "Quick Guide", url: "#", icon: BookCheck },
  { title: "All Files", url: "#", icon: FolderOpen },
  { title: "Feature Updates", url: "#", icon: BellPlus },
];

export function AppSidebar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    // Optionally, render a loading state
    return (
      <div>
        <Skeleton height={30} className="my-2" count={3} />
      </div>
    );
  }

  if (!isSignedIn) {
    // Optionally, render a sign-in prompt
    return <div>Please sign in</div>;
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl mb-4 text-indigo-600 mt-2">
            Summelio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-8 h-8" />
                      <span className="text-[15px]">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="focus:outline-none focus:ring-0 focus:ring-indigo-100">
                  {user.emailAddresses[0].emailAddress}
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <User2 />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/billing" className="flex items-center space-x-2">
                    <CircleDollarSign className="w-5 h-5 mr-2" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {/* SignOutButton Component */}
                  <SignOutButton redirectUrl="http://localhost:3000">
                    <SidebarMenuButton className="focus:outline-none focus:ring-0 focus:ring-indigo-100">
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      <span>Sign out</span>
                    </SidebarMenuButton>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
