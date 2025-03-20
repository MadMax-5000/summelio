"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "../ui/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Square } from "lucide-react"
import { useContext, useRef } from "react"
import { ChatContext } from "./PChatContext"

interface PChatInputProps {
  isDisabled?: boolean
}

const PChatInput = ({ isDisabled }: PChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext)
  const textareRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!message.trim()) return
    addMessage()
    textareRef.current?.focus()
  }

  return (
    <PromptInput
      value={message}
      onValueChange={(value) =>
        handleInputChange({ target: { value } } as React.ChangeEvent<HTMLTextAreaElement>)
      }
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className="w-full max-w-[--breakpoint-md]"
    >
      <PromptInputTextarea
        placeholder="Ask your first question..."
        ref={textareRef}
      />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction tooltip={isLoading ? "Stop generation" : "Send message"}>
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSubmit}
            disabled={isLoading || isDisabled || !message.trim()}
          >
            {isLoading ? (
              <Square className="size-5 fill-current" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  )
}

export default PChatInput
