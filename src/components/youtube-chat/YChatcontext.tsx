// Updated YChatcontext.tsx
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
            try {
                const response = await fetch("/api/message/youtube", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileId,
                        message,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("API error:", errorData);
                    throw new Error(`Something went wrong when sending a message: ${response.status} ${errorData}`);
                }

                return response.body;
            } catch (error) {
                console.error("Error in mutation function:", error);
                throw error;
            }
        },
        onMutate: async ({ message }) => {
            backupMessage.current = message;
            setMessage("");
            // step 1: cancel any pending queries
            await utils.getFileMessages.cancel();
            // step 2: optimistic update
            const previousMessages = utils.getFileMessages.getInfiniteData({
                fileId,
                limit: INFINITE_QUERY_LIMIT,
            });
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
            setIsloading(false);

            if (!stream) {
                return toast.error("There was a problem sending this message");
            }

            try {
                const reader = stream.getReader();
                const decoder = new TextDecoder();
                let done = false;

                // accumulated response
                let accResponse = "";

                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    const chunkValue = decoder.decode(value);

                    accResponse += chunkValue;

                    // append chunk to the actual message
                    utils.getFileMessages.setInfiniteData(
                        { fileId, limit: INFINITE_QUERY_LIMIT },
                        (old) => {
                            if (!old) return { pages: [], pageParams: [] };

                            const isAiResponseCreated = old.pages.some((page) =>
                                page.messages.some((message) => message.id === "ai-response")
                            );

                            const updatedPages = old.pages.map((page) => {
                                if (page === old.pages[0]) {
                                    let updatedMessages;

                                    if (!isAiResponseCreated) {
                                        updatedMessages = [
                                            {
                                                createdAt: new Date().toISOString(),
                                                id: "ai-response",
                                                text: accResponse,
                                                isUserMessage: false,
                                            },
                                            ...page.messages,
                                        ];
                                    } else {
                                        updatedMessages = page.messages.map((message) => {
                                            if (message.id === "ai-response") {
                                                return {
                                                    ...message,
                                                    text: accResponse,
                                                };
                                            }
                                            return message;
                                        });
                                    }

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
            } catch (error) {
                console.error("Error processing stream:", error);
                toast.error("Error processing response stream");
            }
        },
        onError: (error, _, context) => {
            console.error("Mutation error:", error);
            setMessage(backupMessage.current);
            toast.error("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"));

            if (context?.previousMessages) {
                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] };

                        // Restore previous state
                        return {
                            ...old,
                            pages: old.pages.map((page, i) => {
                                if (i === 0) {
                                    return {
                                        ...page,
                                        messages: context.previousMessages
                                    };
                                }
                                return page;
                            })
                        };
                    }
                );
            }
        },
        onSettled: async () => {
            setIsloading(false);
            await utils.getFileMessages.invalidate({ fileId });
        },
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };
    const addMessage = () => {
        if (message.trim()) {
            sendMessage({ message });
        }
    };
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