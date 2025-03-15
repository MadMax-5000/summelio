"use client"

import React from "react";
import PMessages from "../chat/PMessages";
import PChatInput from "../chat/PChatInput";
import { ChatContextProvider } from "../chat/PChatContext";

interface ChatWrapperYouTubeProps {
    fileId: string;
}

const ChatWrapperYouTube = ({ fileId }: ChatWrapperYouTubeProps) => {
    return (
        <ChatContextProvider fileId={fileId}>
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-between flex flex-col mb-28">
                    <PMessages fileId={fileId} />
                </div>
                <PChatInput />
            </div>
        </ChatContextProvider>
    );
};

export default ChatWrapperYouTube;
