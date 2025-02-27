"use client";

import React from "react";
import PMessages from "./PMessages";
import PChatInput from "./PChatInput";
import { trpc } from "@/_trpc/client";
import { Loader2 } from "lucide-react";

interface ChatWrapperPDFProps {
  fileId: string;
}

const ChatWrapperPDF = ({ fileId }: ChatWrapperPDFProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );
  if (true)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <h3 className="font-semibold text-xl ">Loading...</h3>
            <p className="text-sm text-zinc-500">
              we&apos;re preparing your PDF
            </p>
          </div>
        </div>
        <PChatInput />
      </div>
    );
  return (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <PMessages />
      </div>
      <PChatInput />
    </div>
  );
};

export default ChatWrapperPDF;
