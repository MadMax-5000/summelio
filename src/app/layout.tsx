import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Provider";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "simplebar-react/dist/simplebar.min.css";
import { ClerkProvider } from "@clerk/nextjs";
// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  // variable: "--font-inter", // Optional: Use a CSS variable for the font
});

export const metadata: Metadata = {
  title: "Summelio",
  description: "Chat with Your Content —Powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth-callback"
      signUpFallbackRedirectUrl="/auth-callback"
    >
      <html lang="en">
        <Providers>
          <body className={cn(inter.className, "antialiased")}>
            {children} <Toaster />
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
