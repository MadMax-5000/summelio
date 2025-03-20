"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import { useRef } from "react";
import type { useChat } from "ai/react";

type HandleInputChange = ReturnType<typeof useChat>["handleInputChange"];
type HandleSubmit = ReturnType<typeof useChat>["handleSubmit"];
type SetInput = ReturnType<typeof useChat>["setInput"];

interface ChatInputProps {
  input: string;
  handleInputChange: HandleInputChange;
  handleSubmit: HandleSubmit;
  setInput: SetInput;
  // Optionally, add isLoading if available: isLoading?: boolean;
}

const ChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  setInput,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e as React.FormEvent<HTMLFormElement>);
    setInput(""); // clear the input after submission
    textareaRef.current?.focus();
  };

  return (
    <PromptInput
      value={input}
      onValueChange={(value) =>
        handleInputChange({
          target: { value },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      }
      isLoading={false} // update if you have an isLoading state to pass
      onSubmit={onSubmit}
      className="w-full max-w-[--breakpoint-md]"
    >
      <PromptInputTextarea
        placeholder="Ask your first question..."
        ref={textareaRef}
      />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction tooltip="Send message">
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onSubmit}
            disabled={!input.trim()}
          >
            {/* Optionally, you can conditionally show a loading icon if needed */}
            <ArrowUp className="size-5" />
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ChatInput;
