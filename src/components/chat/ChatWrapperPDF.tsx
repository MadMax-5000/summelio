"use client";

import React from "react";
import PMessages from "./PMessages";
import PChatInput from "./PChatInput";
import { trpc } from "@/_trpc/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./PChatContext";

interface ChatWrapperPDFProps {
  fileId: string;
}

const ChatWrapperPDF = ({ fileId }: ChatWrapperPDFProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    { fileId },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  if (isLoading)
    return (
      <div className="relative h-full bg-white flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
            <h3 className="font-semibold text-xl text-gray-800">Loading...</h3>
            <p className="text-base text-zinc-500">
              we&apos;re preparing your PDF
            </p>
          </div>
        </div>
        <div className="p-4">
          <PChatInput isDisabled />
        </div>
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative h-full bg-white flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
            <h3 className="font-semibold text-xl text-gray-800">
              Processing PDF...
            </h3>
            <p className="text-base text-zinc-500">
              This won&apos;t take long, please be patient.
            </p>
          </div>
        </div>
        <div className="p-4">
          <PChatInput isDisabled />
        </div>
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative h-full bg-white flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-600" />
            <h3 className="font-semibold text-xl text-gray-800">
              Too many pages in PDF.
            </h3>
            <p className="text-base text-zinc-500">
              Your <span className="font-medium">Plan</span> supports up to 5
              pages per PDF.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="size-3 mr-1.5" /> Back to
            </Link>
          </div>
        </div>
        <div className="p-4">
          <PChatInput isDisabled />
        </div>
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative h-full bg-white flex flex-col">
        {/* Messages area with scroll */}
        <div className="flex-1 overflow-y-auto">
          <PMessages fileId={fileId} />
        </div>
        {/* Chat input stays fixed at the bottom */}
        <div className="p-4">
          <PChatInput />
        </div>
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapperPDF;
