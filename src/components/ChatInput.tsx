"use client";

import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { type useChat } from "ai/react";

type HandleInputChange = ReturnType<typeof useChat>["handleInputChange"];
type HandleSubmit = ReturnType<typeof useChat>["handleSubmit"];
type SetInput = ReturnType<typeof useChat>["setInput"];

interface ChatInputProps {
  input: string;
  handleInputChange: HandleInputChange;
  handleSubmit: HandleSubmit;
  setInput: SetInput;
}

const ChatInput = ({
  handleInputChange,
  handleSubmit,
  input,
  setInput,
}: ChatInputProps) => {
  return (
    <div className="z-10 bg-white absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col ">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                placeholder="Ask Anything..."
                minLength={4}
                onChange={handleInputChange}
                value={input}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                    setInput("");
                  }
                }}
                autoFocus
                className="resize-none bg-gray-300 rounded-xl text-base text-gray-700"
              />
              <Button
                size="sm"
                type="submit"
                className="absolute z-10 bg-gray-300 right-2 bottom-2 text-black"
              >
                <Send className="size-6 text-gray-700" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
