"use client";

import { Message, useChat } from "@ai-sdk/react";
import { Messages } from "./Messages";
import ChatInput from "./ChatInput";
import { Loader } from "./ui/loader";

export const ChatWrapperURLWrapper = ({
  sessionId,
  initialMessages,
}: {
  sessionId: string;
  initialMessages: Message[];
}) => {
  const {
    messages,
    handleInputChange,
    handleSubmit,
    input,
    setInput,
    isLoading,
  } = useChat({
    api: "/api/chat-stream",
    body: { sessionId },
  });

  // Determine if the loader should be visible.
  // Hide the loader if the latest AI message has started loading.
  const lastMessage = messages[messages.length - 1];
  const showLoader =
    isLoading &&
    (!lastMessage ||
      lastMessage.role !== "assistant" ||
      lastMessage.content.trim() === "");

  return (
    <div className="relative min-h-full bg-white flex flex-col justify-between gap-2">
      <div className="flex-1 text-black justify-between flex flex-col bg-gray-white">
        <Messages messages={messages} setInput={setInput} />
        {showLoader && (
          <div className="px-3 py-2">
            <Loader variant="typing" />
          </div>
        )}
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
