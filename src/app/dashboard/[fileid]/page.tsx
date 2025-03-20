import ChatWrapperPDF from "@/components/chat/ChatWrapperPDF";
import ChatWrapperURL from "@/components/ChatWrapperURL";
import PDFRenderer from "@/components/PDFRenderer";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import ChatWrapperYouTube from "@/components/youtube-chat/ChatWrapperYouTube";
import YouTubeRenderer from "@/components/youtube-chat/YouTubeRenderer";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: { params: Promise<{ fileid: string }> }) => {
  // Await the params before using its properties
  const { fileid } = await params;
  const user = await currentUser();
  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  // make database call
  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Header container for trigger and navbar */}
        <div className="flex flex-col mt-4">
          <nav className="flex items-center bg-white text-black px-4 py-2 space-x-2 relative">
            <SidebarTrigger className="text-gray-600 mr-4" />
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm font-medium">{file.name || "File"}</span>
          </nav>
        </div>

        {/* Main content */}
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          <div className="flex-1 xl:flex">
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
              {file.type === "pdf" ? (
                <PDFRenderer url={`https://utfs.io/f/${file.key}`} />
              ) : file.type === "Web Page" ? (
                <WebsiteRenderer url={file.url} />
              ) : file.type === "Youtube Video" ? (
                <YouTubeRenderer url={file.url} />
              ) : (
                <p>Unsupported content type</p>
              )}
            </div>
          </div>
          <div className="shrink-0 flex-[0.75] h-full border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
            {file.type === "pdf" ? (
              <ChatWrapperPDF fileId={file.id} />
            ) : file.type === "Web Page" ? (
              <ChatWrapperURL url={file.url} />
            ) : file.type === "Youtube Video" ? (
              <ChatWrapperYouTube fileId={file.id} />
            ) : (
              <p>Unsupported type</p>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>

  );
};

export default Page;
