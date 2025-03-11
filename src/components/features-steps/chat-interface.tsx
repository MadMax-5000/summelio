"use client"

import { useState } from "react"
import { Send, User, Bot, FileText } from 'lucide-react'

interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
}

interface ChatInterfaceProps {
    title: string
    initialMessage?: string
    showOptions?: boolean
}

export default function ChatInterface({
    title,
    initialMessage = "Hi there! I'm analyzing your document. What would you like to know about it?",
    showOptions = false,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: initialMessage,
            sender: "bot",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (input.trim() === "") return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")

        // Simulate bot response
        setTimeout(() => {
            let botResponse: Message

            if (showOptions) {
                botResponse = {
                    id: (Date.now() + 1).toString(),
                    content:
                        "Based on your document   .....",
                    sender: "bot",
                    timestamp: new Date(),
                }
            } else {
                botResponse = {
                    id: (Date.now() + 1).toString(),
                    content:
                        "I've analyzed your document and found some interesting patterns. The main topics appear to be related to data analysis and business intelligence. Would you like me to summarize the key points?",
                    sender: "bot",
                    timestamp: new Date(),
                }
            }

            setMessages((prev) => [...prev, botResponse])
        }, 1000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-full">
            {/* PDF Preview Panel */}
            <div className="w-1/3 border-r bg-gray-50 p-4 flex flex-col">
                <div className="flex items-center space-x-2 mb-4 text-gray-700">
                    <span className="font-medium">PDF / Web Page</span>
                </div>
                <div className="flex-1 bg-white rounded-lg border shadow-sm p-4">
                    {/* Placeholder PDF content */}
                    <div className="h-full flex flex-col space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div
                                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.sender === "user" ? "bg-indigo-100 ml-2" : "bg-gray-100 mr-2"
                                        }`}
                                >
                                    {message.sender === "user" ? (
                                        <User className="h-4 w-4 text-indigo-500" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-gray-500" />
                                    )}
                                </div>
                                <div
                                    className={`p-3 rounded-lg ${message.sender === "user" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t p-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                        />
                        <button
                            onClick={handleSend}
                            disabled={input.trim() === ""}
                            className={`p-2 rounded-full ${input.trim() === "" ? "bg-gray-200 text-gray-400" : "bg-indigo-500 text-white"
                                }`}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
