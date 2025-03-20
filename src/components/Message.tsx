import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check } from "lucide-react"; // Import icons
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components from shadcn

interface MessageProps {
  content: string;
  isUserMessage: boolean;
  isComplete?: boolean; // Optional, in case you want to show the copy button for bot messages
}

export const Message = ({ content, isUserMessage, isComplete = true }: MessageProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className={cn("flex items-start space-x-2", { "justify-end": isUserMessage })}>
      {!isUserMessage && (
        <div>
          <img
            src="/images/summelio-black-gray.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
      <div
        className={cn("flex flex-col space-y-1 text-base max-w-md", {
          "items-end": isUserMessage,
          "items-start": !isUserMessage,
        })}
      >
        <div
          className={cn("relative px-4 py-2 rounded-lg inline-block text-black", {
            "bg-gray-200 text-black": isUserMessage,
            "bg-white text-gray-900": !isUserMessage,
          })}
          style={{ fontSize: "15px" }}
        >
          <ReactMarkdown
            components={{
              p: ({ node, children, ...props }) => (
                <p
                  {...props}
                  className={cn("prose", {
                    "text-black": isUserMessage,    // change this from text-gray-100 to text-black
                    "text-gray-900": !isUserMessage,
                  })}
                >
                  {children}
                </p>
              ),
            }}
          >
            {content}
          </ReactMarkdown>


        </div>
        {/* Copy button for bot messages */}
        {!isUserMessage && isComplete && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(content)}
                  className="bg-white text-gray-600 hover:bg-gray-100 p-2 rounded flex items-center justify-center transition-all duration-200 ml-4 mt-1"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500 transition-all duration-200" />
                  ) : (
                    <Copy className="w-4 h-4 transition-all duration-200" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {isUserMessage && (
        <div
        >
        </div>
      )}
    </div>
  );
};
