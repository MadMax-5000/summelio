import { trpc } from "@/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import Skeleton from "react-loading-skeleton";
import PMessage from "../chat/PMessage";
import { useContext, useEffect, useMemo, useRef } from "react";
import { ChatContext } from "./YChatcontext";
import { useIntersection } from "@mantine/hooks";
import { Loader } from "../ui/loader";
import { PromptSuggestion } from "../ui/prompt-suggestion";

interface PMessagesProps {
    fileId: string;
}

const PMessages = ({ fileId }: PMessagesProps) => {
    const { isLoading: isAiThinking, handleInputChange, message } = useContext(ChatContext);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery(
        {
            fileId,
            limit: INFINITE_QUERY_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage?.nextCursor,
            keepPreviousData: true,
        }
    );

    // Function to handle suggestion clicks
    const handleSuggestionClick = (suggestion: string) => {
        // Create a synthetic event to mimic the behavior of input change
        const syntheticEvent = {
            target: { value: suggestion }
        } as React.ChangeEvent<HTMLTextAreaElement>;

        // Update the message in the ChatContext
        handleInputChange(syntheticEvent);
    };

    // Reverse messages so older messages are at the top
    const messages = data?.pages.flatMap((page) => page.messages).reverse() || [];

    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader variant="typing" />
            </span>
        ),
    };

    const combinedMessages = useMemo(() => {
        return [...messages, ...(isAiThinking ? [loadingMessage] : [])];
    }, [messages, isAiThinking]);


    // Infinite scroll for older messages
    const { ref, entry } = useIntersection({
        root: messagesContainerRef.current,
        threshold: 1,
    });
    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);

    // Scroll to the last message when new messages are added
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [combinedMessages]);

    return (
        <div
            ref={messagesContainerRef}
            className="flex flex-col gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2"
            style={{ maxHeight: "400px" }} // Fixed height matching placeholders
        >
            {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((message, i) => {
                    const isLast = i === combinedMessages.length - 1;
                    return (
                        <div key={message.id} ref={isLast ? lastMessageRef : null}>
                            <PMessage
                                message={message}
                                isNextMesageSamePerson={
                                    i < combinedMessages.length - 1 &&
                                    combinedMessages[i + 1].isUserMessage === message.isUserMessage
                                }
                            />
                        </div>
                    );
                })
            ) : isLoading ? (
                <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                </div>
            ) : (
                <div className="mb-5 items-center">
                    <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                        <PromptSuggestion
                            onClick={() => handleSuggestionClick("Summarize this URL for me")}>
                            Summarize this WEB Page for me
                        </PromptSuggestion>

                        <PromptSuggestion
                            onClick={() => handleSuggestionClick("What are the key points in this article?")}>
                            What are the key points?
                        </PromptSuggestion>

                        <PromptSuggestion
                            onClick={() => handleSuggestionClick("Generate questions about this content")}>
                            Generate questions about this
                        </PromptSuggestion>

                        <PromptSuggestion
                            onClick={() => handleSuggestionClick("Extract all data tables from this URL")}>
                            Extract data tables
                        </PromptSuggestion>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMessages;