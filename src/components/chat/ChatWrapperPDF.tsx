"use client";

import React from "react";
import PMessages from "./PMessages";
import PChatInput from "./PChatInput";
import { trpc } from "@/_trpc/client";
import { Loader2, XCircle, ChevronLeft } from "lucide-react";
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
      refetchInterval: (res) =>
        res?.status === "SUCCESS" || res?.status === "FAILED" ? false : 500,
    }
  );

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
        <h3 className="font-semibold text-xl text-gray-800">Loading...</h3>
        <p className="text-base text-zinc-500">
          We're preparing your PDF.
        </p>
      </div>
    );
  } else if (data?.status === "PROCESSING") {
    content = (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
        <h3 className="font-semibold text-xl text-gray-800">
          Processing PDF...
        </h3>
        <p className="text-base text-zinc-500">
          This won't take long, please be patient.
        </p>
      </div>
    );
  } else if (data?.status === "FAILED") {
    content = (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <XCircle className="h-8 w-8 text-red-600" />
        <h3 className="font-semibold text-xl text-gray-800">
          Too many pages in PDF.
        </h3>
        <p className="text-base text-zinc-500">
          Your <span className="font-medium">Plan</span> supports up to 5 pages
          per PDF.
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
    );
  } else {
    content = <PMessages fileId={fileId} />;
  }

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative h-[calc(100vh-4rem)] bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto relative">{content}</div>

        {/* Chat Input at Bottom */}
        <div className="p-4 sticky bottom-0 bg-white border-t">
          <PChatInput
            isDisabled={
              isLoading ||
              data?.status === "PROCESSING" ||
              data?.status === "FAILED"
            }
          />
        </div>
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapperPDF;