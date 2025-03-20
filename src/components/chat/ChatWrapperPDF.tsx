"use client";

import React from "react";
import PMessages from "./PMessages";
import PChatInput from "./PChatInput";
import { trpc } from "@/_trpc/client";
import {
  ChevronLeft,
  Loader2,
  XCircle,
  MessageSquare,
  FileText,
  Edit,
} from "lucide-react";
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

  // Tab state (0: Chat, 1: Summary, 2: Notes)
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);

  // Define tabs with icons
  const tabs = [
    { id: 0, label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: 1, label: "Summary", icon: <FileText className="h-4 w-4" /> },
    { id: 2, label: "Notes", icon: <Edit className="h-4 w-4" /> },
  ];

  // Decide what to render in the main content area
  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
        <h3 className="font-semibold text-xl text-gray-800">Loading...</h3>
        <p className="text-base text-zinc-500">
          We&apos;re preparing your PDF.
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
          This won&apos;t take long, please be patient.
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
    // File is ready: show tab content
    if (activeTabIndex === 0) {
      // Chat
      content = <PMessages fileId={fileId} />;
    } else if (activeTabIndex === 1) {
      // Summary
      content = (
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">PDF Summary</h2>
          <p className="text-sm text-gray-600">
            {/* Replace with actual summary or dynamic content */}
            This is a placeholder for the PDF summary. You can integrate
            your summary generation logic or show a summary from your DB.
          </p>
        </div>
      );
    } else {
      // Notes
      content = (
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm text-gray-600">
            {/* Replace with your note-taking UI, form, etc. */}
            This is a placeholder for user notes. You can add a form or text
            area to let users save notes.
          </p>
        </div>
      );
    }
  }

  // Final render
  return (
    <ChatContextProvider fileId={fileId}>
      {/* 
        Exactly like your old layout:
        - h-full flex flex-col
        - middle area scrolls
        - input pinned at bottom
      */}
      <div className="relative h-screen bg-white flex flex-col">
        {/* TABS at the top */}
        <div className="pt-4 px-4">
          <div className="relative flex justify-center items-center border-b border-gray-200">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabIndex(idx)}
                className={`relative z-10 flex-1 py-3 text-sm flex flex-col items-center justify-center transition-colors
                  ${activeTabIndex === idx
                    ? "text-black font-semibold"
                    : "text-gray-500"
                  }
                `}
              >
                {tab.icon}
                <span className="mt-1">{tab.label}</span>
              </button>
            ))}
            {/* Black slider indicator */}
            <div
              className="absolute bottom-0 left-0 h-[3px] bg-black transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${activeTabIndex * 100}%)`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">{content}</div>

        {/* CHAT INPUT AT BOTTOM (only enabled if file is ready + Chat tab) */}
        <div className="p-4 sticky bottom-0 bg-white shadow-md">
          <PChatInput
            isDisabled={
              isLoading ||
              data?.status === "PROCESSING" ||
              data?.status === "FAILED" ||
              activeTabIndex !== 0
            }
          />
        </div>
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapperPDF;
