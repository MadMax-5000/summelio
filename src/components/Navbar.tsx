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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "./ui/button";
import { ArrowBigRightDash, ArrowRight, ArrowRightIcon } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "PDF",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Web page",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Video",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Excel",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Audio",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "PowerPoint",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
  {
    title: "Books",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
  {
    title: "Documentation",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export function Navbar() {
  return (
    <div className="sticky z-[100] w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center px-6 lg:px-8 border-b border-gray-600/10 py-3">
        {/* Logo on the left */}
        <div className="flex lg:flex-1">
          <Link href="/" passHref legacyBehavior>
            <a className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <Image
                alt="Your Company Logo"
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
                width={32}
                height={32}
              />
            </a>
          </Link>
        </div>

        {/* Navigation Menu in the center */}
        <div className="flex justify-center flex-1 relative">
          <NavigationMenu>
            <NavigationMenuList className="gap-4">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-medium text-base text-gray-700">
                  Getting started
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link href="/" passHref legacyBehavior>
                          <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <div className="mb-2 mt-4 text-lg font-medium">
                              shadcn/ui
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Beautifully designed components built with Radix
                              UI and Tailwind CSS.
                            </p>
                          </a>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem
                      href="/docs/primitives/typography"
                      title="Typography"
                    >
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-medium text-base text-pretty text-gray-700">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" passHref legacyBehavior>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-medium text-base text-pretty text-gray-700"
                    )}
                  >
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Button on the right */}
        <div className="flex lg:flex-1 justify-end gap-3">
          <SignInButton mode="modal">
            <Button
              className="text-black font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 flex focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              variant="ghost"
            >
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 font-medium px-4 rounded-md shadow-sm transition-colors duration-200 flex focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              variant="ghost"
            >
              Sign Up
              <ArrowRightIcon className="size-5" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={props.href as string} passHref legacyBehavior>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="leading-none font-medium text-base text-pretty">
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-light">
              {children}
            </p>
          </a>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
