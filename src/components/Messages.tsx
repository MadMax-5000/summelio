import { type Message as TMessage } from "ai/react";
import { Message } from "./Message";
import { MessageSquare } from "lucide-react";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";
import { PromptSuggestion } from "./ui/prompt-suggestion";

interface MessagesProps {
  messages: TMessage[];
  setInput?: (input: string) => void;
}

export const Messages = ({ messages, setInput }: MessagesProps) => {
  const handleSuggestionClick = (suggestion: string) => {
    if (setInput) {
      setInput(suggestion);
    }
  };

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto ...">
      {messages.length ? (
        messages
          .slice()
          .reverse()
          .map((message, i) => (
            <Message
              key={i}
              content={message.content}
              isUserMessage={message.role === "user"}
            />
          ))
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