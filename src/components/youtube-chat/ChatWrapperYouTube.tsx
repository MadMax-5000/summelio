"use client"

import React from "react";
import YMessages from "./YMessages";
import YChatInput from "./YChatInput";
import { ChatContextProvider } from "./YChatcontext";

interface ChatWrapperYouTubeProps {
    fileId: string;
}

const ChatWrapperYouTube = ({ fileId }: ChatWrapperYouTubeProps) => {
    return (
        <ChatContextProvider fileId={fileId}>
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-between flex flex-col mb-28">
                    <YMessages fileId={fileId} />
                </div>
                <YChatInput />
            </div>
        </ChatContextProvider>
    );
};

export default ChatWrapperYouTube;