import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface MessageProps {
  content: string;
  isUserMessage: boolean;
}

export const Message = ({ content, isUserMessage }: MessageProps) => {
  return (
    <div className={cn("flex items-end", { "justify-end": isUserMessage })}>
      <div
        className={cn(
          "relative flex h-6 aspect-square items-center justify-center",
          {
            "order-2 bg-indigo-600 rounded-sm": isUserMessage,
            "order-1 bg-gray-800 rounded-sm": !isUserMessage,
          }
        )}
      >
        {isUserMessage ? (
          <User className="fill-gray-200 text-gray-200 h-3/4 w-3/4" />
        ) : (
          <Bot className="fill-gray-300 h-3/4 w-3/4" />
        )}
      </div>
      <div
        className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
          "order-1 items-end": isUserMessage,
          "order-2 items-start": !isUserMessage,
        })}
      >
        <div
          className={cn("px-4 py-2 rounded-lg inline-block", {
            "bg-indigo-600 text-gray-100": isUserMessage,
            "bg-gray-300 text-gray-900": !isUserMessage,
          })}
        >
          {content}
        </div>
      </div>
    </div>
  );
};
