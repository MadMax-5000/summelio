"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRightIcon, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm backdrop-blur-md">
      <div className="flex justify-between items-center px-4 sm:px-8 lg:px-16 py-3">
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

        {/* Desktop Nav Links */}
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button className="bg-indigo-700 text-white hover:bg-indigo-900 flex items-center gap-3 px-6 py-2 text-base">
                Dashboard <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-white border-t">
          <div className="flex flex-col space-y-4 text-gray-700 font-medium text-base">
            <Link
              href="#feature-section"
              className="hover:text-gray-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-gray-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/use-cases"
              className="hover:text-gray-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Use Cases
            </Link>
            <Link
              href="#faq"
              className="hover:text-gray-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>

            <div className="flex flex-col space-y-3 pt-2">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-indigo-700 text-white hover:bg-indigo-900 flex items-center justify-center gap-3 px-6 py-2 text-base w-full">
                    Dashboard <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton>
                    <Button
                      variant="ghost"
                      className="text-indigo-700 hover:bg-indigo-100 w-full justify-start px-4 py-2 text-base"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="bg-indigo-700 text-white hover:bg-indigo-900 flex items-center justify-center gap-3 px-6 py-2 text-base w-full">
                      Sign Up <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
