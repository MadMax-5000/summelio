"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full bg-gray-50/20 backdrop-blur-md shadow-md">
      <div className="flex justify-between items-center px-6 lg:px-12 border-b border-indigo-200 py-3">
        {/* Logo */}
        <Link href="/" passHref legacyBehavior>
          <a className="flex items-center">
            <Image
              alt="Summelio logo"
              src="/images/SUMMELIO.png"
              className="h-10 w-auto"
              width={40}
              height={40}
            />
          </a>
        </Link>

        {/* Navigation Menu */}
        <div className="flex-grow flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-8">
              <NavigationMenuItem>
                <Link href="#feature-section" passHref legacyBehavior>
                  <NavigationMenuLink className="font-medium text-base text-gray-700 hover:text-gray-900 px-4">
                    Features
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#pricing" passHref legacyBehavior>
                  <NavigationMenuLink className="font-medium text-base text-gray-700 hover:text-indigo-900 px-4">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/use-cases" passHref legacyBehavior>
                  <NavigationMenuLink className="font-medium text-base text-gray-700 hover:text-indigo-900 px-4">
                    Use Cases
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#faq" passHref legacyBehavior>
                  <NavigationMenuLink className="font-medium text-base text-gray-700 hover:text-indigo-900 px-4">
                    FAQ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-4">
          <SignInButton >
            <Button
              className="text-indigo-700 font-medium py-2 px-4 rounded-md hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-400"
              variant="ghost"
            >
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton >
            <Button className="bg-indigo-700 hover:bg-indigo-900 text-white flex items-center gap-2 font-medium py-2 px-4 rounded-md shadow transition-colors duration-200 focus:ring-2 focus:ring-indigo-400">
              Sign Up <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
