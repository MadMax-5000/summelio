"use client"

import { trpc } from "@/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { createContext, ReactNode } from "react";
import { toast } from "sonner";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => { },
  message: "",
  handleInputChange: () => { },
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsloading] = useState<boolean>(false);
  const utils = trpc.useContext();
  const backupMessage = useRef<string>("");
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong when sending a message");
      }
      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");
      // step 1: cancel any pending queries
      await utils.getFileMessages.cancel();
      // step 2: optimistic update
      const previousMessages = utils.getFileMessages.getInfiniteData();
      // step 3: insert new message
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }
          const newPages = [...old.pages];
          const latestPages = newPages[0]!;
          latestPages.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPages.messages,
          ];
          newPages[0] = latestPages;
          return {
            ...old,
            pages: newPages,
          };
        }
      );
      setIsloading(true);
      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      if (!stream) {
        setIsloading(false);
        return toast("There was a problem sending this message");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Create AI response message immediately with empty text
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const newPages = [...old.pages];
          const latestPage = newPages[0]!;

          // Add the initial empty AI response message
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: "ai-response",
              text: "",
              isUserMessage: false,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;
          return { ...old, pages: newPages };
        }
      );

      // accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkValue = decoder.decode(value);
          accResponse += chunkValue;

          // Update the AI response with the accumulated text
          utils.getFileMessages.setInfiniteData(
            { fileId, limit: INFINITE_QUERY_LIMIT },
            (old) => {
              if (!old) return { pages: [], pageParams: [] };

              const updatedPages = old.pages.map((page, i) => {
                if (i === 0) {
                  const updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });

                  return {
                    ...page,
                    messages: updatedMessages,
                  };
                }
                return page;
              });

              return { ...old, pages: updatedPages };
            }
          );
        }
      }

      // Mark the AI response as complete
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const updatedPages = old.pages.map((page, i) => {
            if (i === 0) {
              const updatedMessages = page.messages.map((message) => {
                if (message.id === "ai-response") {
                  return {
                    ...message,
                    isComplete: true,
                  };
                }
                return message;
              });

              return {
                ...page,
                messages: updatedMessages,
              };
            }
            return page;
          });

          return { ...old, pages: updatedPages };
        }
      );

      setIsloading(false);
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
      setIsloading(false);
    },
    onSettled: async () => {
      await utils.getFileMessages.invalidate({ fileId });
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => sendMessage({ message });
  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};