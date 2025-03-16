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
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/** left side rendering */}
        <div className="flex-1 xl:flex ">
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
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
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
  );
};

export default Page;
