"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm backdrop-blur-md">
      <div className="flex justify-between items-center px-8 lg:px-16 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/SUMMELIO.png"
            alt="Logo"
            width={50}
            height={50}
            quality={100}
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex space-x-10 text-gray-700 font-medium text-base">
          <Link href="#feature-section" className="hover:text-gray-900">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/use-cases" className="hover:text-gray-900">
            Use Cases
          </Link>
          <Link href="#faq" className="hover:text-gray-900">
            FAQ
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-6">
          <SignInButton>
            <Button
              variant="ghost"
              className="text-indigo-700 hover:bg-indigo-100 px-4 py-2 text-base"
            >
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button className="bg-indigo-700 text-white hover:bg-indigo-900 flex items-center gap-3 px-6 py-2 text-base">
              Sign Up <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </nav>
  );
}
