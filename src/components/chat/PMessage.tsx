import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/Pmessage";
import ReactMarkdown from "react-markdown";
import { forwardRef } from "react";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

// Define the props interface
interface PMessageProps {
  message: ExtendedMessage;
  isNextMesageSamePerson: boolean;
}

// Define the component with forwardRef
const PMessage = forwardRef<HTMLDivElement, PMessageProps>(
  ({ message, isNextMesageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start space-x-2", {
          "justify-end": message.isUserMessage,
          "justify-start": !message.isUserMessage,
        })}
      >
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
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ node, children, ...props }) => (
                    <p
                      {...props}
                      className={cn("prose", {
                        "text-black": message.isUserMessage,
                      })}
                    >
                      {children}
                    </p>
                  ),
                  code({ node, inline, className, children, ...props }: {
                    node?: any;
                    inline?: boolean;
                    className?: string;
                    children?: React.ReactNode;
                    [key: string]: any
                  }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={dark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        </div>
      </div>
    );
  }
);

PMessage.displayName = "PMessage";
export default PMessage;