import { trpc } from "@/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import PMessage from "./PMessage";
import { useContext, useEffect, useMemo, useRef } from "react";
import { ChatContext } from "./PChatContext";
import { useIntersection } from "@mantine/hooks";
import { Loader } from "../ui/loader";

interface PMessagesProps {
  fileId: string;
}

const PMessages = ({ fileId }: PMessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

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

  const { ref, entry } = useIntersection({
    root: messagesContainerRef.current,
    threshold: 1,
  });
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [combinedMessages]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2"
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
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="size-8 text-indigo-500" />
          <h3 className="font-semibold text-xl">You're all Set!</h3>
          <p className="text-gray-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default PMessages;