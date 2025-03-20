"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

export type PromptSuggestionProps = {
  children: React.ReactNode
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  className?: string
  highlight?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function PromptSuggestion({
  children,
  variant,
  size,
  className,
  highlight,
  ...props
}: PromptSuggestionProps) {
  const isHighlightMode = highlight !== undefined && highlight.trim() !== ""
  const content = typeof children === "string" ? children : ""

  if (!isHighlightMode) {
    return (
      <Button
        variant={variant || "outline"}
        size={size || "lg"}
        className={cn("rounded-full", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }

  if (!content) {
    return (
      <Button
        variant={variant || "ghost"}
        size={size || "sm"}
        className={cn(
          "w-full cursor-pointer justify-start rounded-xl py-2",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }

  const trimmedHighlight = highlight.trim()
  const contentLower = content.toLowerCase()
  const highlightLower = trimmedHighlight.toLowerCase()
  const shouldHighlight = contentLower.includes(highlightLower)

  return (
    <Button
      variant={variant || "ghost"}
      size={size || "sm"}
      className={cn(
        "w-full cursor-pointer justify-start gap-0 rounded-xl py-2",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        className
      )}
      {...props}
    >
      {shouldHighlight ? (
        (() => {
          const index = contentLower.indexOf(highlightLower)
          if (index === -1)
            return (
              <span className="text-zinc-500 whitespace-pre-wrap dark:text-zinc-400">
                {content}
              </span>
            )

          const actualHighlightedText = content.substring(
            index,
            index + highlightLower.length
          )

          const before = content.substring(0, index)
          const after = content.substring(index + actualHighlightedText.length)

          return (
            <>
              {before && (
                <span className="text-zinc-500 whitespace-pre-wrap dark:text-zinc-400">
                  {before}
                </span>
              )}
              <span className="text-zinc-900 font-medium whitespace-pre-wrap dark:text-zinc-50">
                {actualHighlightedText}
              </span>
              {after && (
                <span className="text-zinc-500 whitespace-pre-wrap dark:text-zinc-400">
                  {after}
                </span>
              )}
            </>
          )
        })()
      ) : (
        <span className="text-zinc-500 whitespace-pre-wrap dark:text-zinc-400">
          {content}
        </span>
      )}
    </Button>
  )
}

export { PromptSuggestion }
