"use client"

import { useState, useEffect, useMemo } from "react"
import { Bot } from "lucide-react"

interface Message {
    id: number
    text: string
    position: "left-top" | "left-bottom" | "right-top" | "right-bottom"
    delay: number
    distance: number
}

export default function AIGraphic() {
    const [visibleMessages, setVisibleMessages] = useState<number[]>([])

    // Memoize messages array to prevent recreation on each render
    const messages = useMemo<Message[]>(() => [
        { id: 1, text: "Analyzing document...", position: "left-top", delay: 0, distance: 130 },
        { id: 2, text: "Extracting key information", position: "left-bottom", delay: 800, distance: 130 },
        { id: 3, text: "Processing text content", position: "right-top", delay: 1600, distance: 130 },
        { id: 4, text: "Generating insights", position: "right-bottom", delay: 2400, distance: 130 },
    ], [])

    useEffect(() => {
        const timers: NodeJS.Timeout[] = []

        messages.forEach((message) => {
            const timer = setTimeout(() => {
                setVisibleMessages((prev) => [...prev, message.id])
            }, message.delay)

            timers.push(timer)
        })

        // Reset animation after all messages appear
        const resetTimer = setTimeout(
            () => {
                setVisibleMessages([])

                // Restart animation after a pause
                const restartTimer = setTimeout(() => {
                    messages.forEach((message) => {
                        const timer = setTimeout(() => {
                            setVisibleMessages((prev) => [...prev, message.id])
                        }, message.delay)

                        timers.push(timer)
                    })
                }, 2000)

                timers.push(restartTimer)
            },
            messages[messages.length - 1].delay + 3000,
        )

        timers.push(resetTimer)

        return () => {
            timers.forEach((timer) => clearTimeout(timer))
        }
    }, [messages])

    // Helper function to get position styles based on message position
    const getPositionStyles = (position: Message["position"], distance: number) => {
        switch (position) {
            case "left-top":
                return { left: `-${distance}px`, top: "-50px" }
            case "left-bottom":
                return { left: `-${distance}px`, bottom: "-50px" }
            case "right-top":
                return { right: `-${distance}px`, top: "-50px" }
            case "right-bottom":
                return { right: `-${distance}px`, bottom: "-50px" }
            default:
                return {}
        }
    }

    // Helper function to get dot indicator styles
    const getDotStyles = (position: Message["position"]) => {
        switch (position) {
            case "left-top":
            case "left-bottom":
                return { right: "-4px", top: "50%", transform: "translateY(-50%)" }
            case "right-top":
            case "right-bottom":
                return { left: "-4px", top: "50%", transform: "translateY(-50%)" }
            default:
                return {}
        }
    }

    return (
        <div className="relative h-full w-full flex items-center justify-center">
            <div className="relative">
                {/* AI Bot Icon */}
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center z-10 relative shadow-lg">
                    <Bot className="h-12 w-12 text-indigo-500" />
                </div>

                {/* Pulsing circle animation */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-indigo-100 opacity-30 animate-ping"></div>
                </div>

                {/* Floating message bubbles */}
                {messages.map((message) => {
                    const positionStyles = getPositionStyles(message.position, message.distance)
                    const dotStyles = getDotStyles(message.position)

                    return (
                        <div
                            key={message.id}
                            className="absolute transition-all duration-500"
                            style={{
                                ...positionStyles,
                                transitionDelay: `${message.delay * 0.5}ms`,
                                opacity: visibleMessages.includes(message.id) ? 1 : 0,
                                transform: visibleMessages.includes(message.id) ? "scale(1)" : "scale(0.8)",
                                zIndex: 20,
                            }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-black opacity-5 rounded-lg blur-sm transform translate-y-1"></div>
                                <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md text-gray-700 text-sm font-medium backdrop-blur-sm backdrop-filter border border-indigo-100 max-w-[150px]">
                                    {message.text}

                                    {/* Small dot indicator */}
                                    <div className="absolute w-2 h-2 rounded-full bg-indigo-500" style={dotStyles}></div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}