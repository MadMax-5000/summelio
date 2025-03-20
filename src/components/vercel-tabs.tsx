"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { File, Globe, Youtube } from "lucide-react"

interface VercelTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
    file: {
        id: string
        name: string
        type: string
        url?: string
        key?: string
    }
    children: React.ReactNode
}

export function VercelTabs({ activeTab, onTabChange, file, children }: VercelTabsProps) {
    // Determine which tabs to show based on file type
    const showPdfTab = file.type === "pdf"
    const showWebTab = file.type === "Web Page"
    const showYoutubeTab = file.type === "Youtube Video"

    return (
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <div className="border-b border-border">
                    <div className="flex items-center px-4 py-2">
                        <TabsList className="h-9 bg-transparent p-0">
                            {showPdfTab && (
                                <TabsTrigger
                                    value="pdf"
                                    className={cn(
                                        "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                                    )}
                                >
                                    <File className="mr-2 h-4 w-4" />
                                    Document
                                </TabsTrigger>
                            )}
                            {showWebTab && (
                                <TabsTrigger
                                    value="web"
                                    className={cn(
                                        "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                                    )}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Web Page
                                </TabsTrigger>
                            )}
                            {showYoutubeTab && (
                                <TabsTrigger
                                    value="youtube"
                                    className={cn(
                                        "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                                    )}
                                >
                                    <Youtube className="mr-2 h-4 w-4" />
                                    YouTube
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>
                </div>
                <div className="mt-0">{children}</div>
            </Tabs>
        </div>
    )
}

