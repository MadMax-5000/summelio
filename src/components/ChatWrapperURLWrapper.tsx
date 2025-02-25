"use client";

import { Message, useChat } from "@ai-sdk/react";
import { Messages } from "./Messages";
import ChatInput from "./ChatInput";

export const ChatWrapperURLWrapper = ({
  sessionId,
  initialMessages,
}: {
  sessionId: string;
  initialMessages: Message[];
}) => {
  const { messages, handleInputChange, handleSubmit, input, setInput } =
    useChat({
      api: "/api/chat-stream",
      body: { sessionId },
    });
  return (
    <div className="relative min-h-full bg-white flex flex-col justify-between gap-2">
      <div className="flex-1 text-black justify-between flex flex-col bg-gray-white">
        <Messages messages={messages} />
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        setInput={setInput}
      />
    </div>
  );
};
