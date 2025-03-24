// C:\Users\hp\summmelio\src\components\chat\PMessage.tsx

import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/Pmessage";
import ReactMarkdown from "react-markdown";
import { forwardRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import java from "highlight.js/lib/languages/java";

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('java', java);

// Import CSS for styling
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/default.css';

interface PMessageProps {
  message: ExtendedMessage;
  isNextMesageSamePerson: boolean;
}

const PMessage = forwardRef<HTMLDivElement, PMessageProps>(
  ({ message, isNextMesageSamePerson }, ref) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-start space-x-2", {
          "justify-end": message.isUserMessage,
          "justify-start": !message.isUserMessage,
        })}
      >
        {!message.isUserMessage && (
          <img
            src="/images/summelio-black-gray.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        )}
        <div
          className={cn("flex flex-col space-y-1 text-base max-w-md", {
            "items-end": message.isUserMessage,
            "items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("relative px-4 py-2 rounded-lg inline-block", {
              "bg-gray-200 text-black": message.isUserMessage,
              "bg-white text-gray-900": !message.isUserMessage,
              "rounded-br-none":
                !isNextMesageSamePerson && message.isUserMessage,
              "rounded-bl-none":
                !isNextMesageSamePerson && !message.isUserMessage,
            })}
            style={{ fontSize: "15px" }}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                  p: ({ children, ...props }) => (
                    <p
                      {...props}
                      className={cn("prose", {
                        "text-black": message.isUserMessage,
                      })}
                    >
                      {children}
                    </p>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
          {!message.isUserMessage &&
            message.isComplete === true &&
            typeof message.text === "string" && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => copyToClipboard(message.text as string)}
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
      </div>
    );
  }
);

PMessage.displayName = "PMessage";

export default PMessage;