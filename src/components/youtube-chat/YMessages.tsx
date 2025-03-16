import { trpc } from "@/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import PMessage from "../chat/PMessage";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./YChatcontext";
import { useIntersection } from "@mantine/hooks";

interface YMessagesProps {
    fileId: string;
}

const YMessages = ({ fileId }: YMessagesProps) => {
    const { isLoading: isAiThinking } = useContext(ChatContext);
    const { data, isLoading, fetchNextPage } =
        trpc.getFileMessages.useInfiniteQuery(
            {
                fileId,
                limit: INFINITE_QUERY_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage?.nextCursor,
                keepPreviousData: true,
            }
        );
    const messages = data?.pages.flatMap((page) => page.messages);
    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
            </span>
        ),
    };
    const combinedMessages = [
        ...(isAiThinking ? [loadingMessage] : []),
        ...(messages ?? []),
    ];
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({
        root: lastMessageRef.current,
        threshold: 1,
    });
    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);
    return (
        <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((message, i) => {
                    const isNextMessageSamePerson =
                        combinedMessages[i - 1]?.isUserMessage ===
                        combinedMessages[i]?.isUserMessage;
                    if (i === combinedMessages.length - 1) {
                        return (
                            <PMessage
                                ref={ref}
                                message={message}
                                key={message.id}
                                isNextMesageSamePerson={isNextMessageSamePerson}
                            />
                        );
                    } else
                        return (
                            <PMessage
                                message={message}
                                key={message.id}
                                isNextMesageSamePerson={isNextMessageSamePerson}
                            />
                        );
                })
            ) : isLoading ? (
                <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-16 " />
                    <Skeleton className="h-16 " />
                    <Skeleton className="h-16 " />
                    <Skeleton className="h-16 " />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="size-8 text-indigo-500" />
                    <h3 className="font-semibold text-xl">YouTube Chat Ready!</h3>
                    <p className="text-gray-500 text-sm">
                        Ask a question about this YouTube video.
                    </p>
                </div>
            )}
        </div>
    );
};

export default YMessages;