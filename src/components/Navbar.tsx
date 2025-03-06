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
import { FileText, Globe, ArrowRightIcon } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

const components = [
  {
    title: "PDF",
    href: "/features/pdf",
    description: "Upload and analyze your PDF to extract key insights",
    icon: <FileText className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "Web Page",
    href: "/features/web-page",
    description: "Summarize web pages into concise, AI-generated responses",
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
  },
];

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
                <NavigationMenuTrigger className="font-medium text-base text-gray-700 hover:text-gray-900">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-[450px] bg-white rounded-lg shadow-lg border border-indigo-200 p-4">
                  <ul className="flex flex-col gap-3">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        <div className="flex items-center gap-3">
                          {component.icon}
                          <span className="text-gray-700 text-sm">
                            {component.description}
                          </span>
                        </div>
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
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
          <SignInButton mode="modal">
            <Button
              className="text-indigo-700 font-medium py-2 px-4 rounded-md hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-400"
              variant="ghost"
            >
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-indigo-700 hover:bg-indigo-900 text-white flex items-center gap-2 font-medium py-2 px-4 rounded-md shadow transition-colors duration-200 focus:ring-2 focus:ring-indigo-400">
              Sign Up <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link href={props.href as string} passHref legacyBehavior>
            <a
              ref={ref}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md transition-colors hover:bg-indigo-50",
                className
              )}
              {...props}
            >
              <div className="flex flex-col">
                <span className="font-medium text-indigo-800">{title}</span>
                <div className="mt-1 text-sm text-indigo-600">{children}</div>
              </div>
            </a>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
