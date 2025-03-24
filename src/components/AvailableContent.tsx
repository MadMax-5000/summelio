"use client"

import { useState } from "react"
import {
    Youtube,
    Globe,
    FileText,
    FileIcon,
    FileSpreadsheet,
    FileImage,
    Music,
    BookOpen,
    CheckCircle,
    Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ContentTypes() {
    const [hoveredItem, setHoveredItem] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("available")

    const availableTypes = [
        {
            name: "YouTube Videos",
            icon: Youtube,
            description: "Instantly analyze and interact with YouTube content",
        },
        {
            name: "Web Pages",
            icon: Globe,
            description: "Extract insights from any web page",
        },
        {
            name: "PDF Documents",
            icon: FileText,
            description: "Seamless PDF document understanding",
        },
    ]

    const comingSoonTypes = [
        {
            name: "Word Documents",
            icon: FileIcon,
            description: "Support for Microsoft Word documents and Google Docs",
        },
        {
            name: "Excel Spreadsheets",
            icon: FileSpreadsheet,
            description: "Support for Microsoft Excel documents and Google Sheets",
        },
        {
            name: "PowerPoint",
            icon: FileImage,
            description: "Support for Microsoft PowerPoint documents and Google Slides",
        },
        {
            name: "Audio Files",
            icon: Music,
            description: "MP3, WAV, and other audio formats",
        },
        {
            name: "Ebooks",
            icon: BookOpen,
            description: "EPUB, MOBI, and other ebook formats",
        },
    ]

    return (
        <section className="relative overflow-hidden py-24 px-4 bg-gray-50 dark:bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.03),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_40%)] pointer-events-none"></div>

            <div className="container mx-auto relative z-10 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-6xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white mb-4 leading-tight">
                        One App to Chat with Them All
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Chat with different content formats all in one place.
                    </p>
                </div>

                <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-center mb-12">
                        <TabsList className="p-1 bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-800">
                            <TabsTrigger
                                value="available"
                                className={cn(
                                    "px-6 py-2 rounded-full transition-all duration-200",
                                    activeTab === "available"
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900",
                                )}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Available Now
                            </TabsTrigger>
                            <TabsTrigger
                                value="coming-soon"
                                className={cn(
                                    "px-6 py-2 rounded-full transition-all duration-200",
                                    activeTab === "coming-soon"
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900",
                                )}
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Coming Soon
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="available" className="mt-0 space-y-4">
                        {availableTypes.map((type, index) => (
                            <Card
                                key={index}
                                className={cn(
                                    "transition-all duration-200 border-gray-200 dark:border-gray-800",
                                    hoveredItem === index && "shadow-lg",
                                )}
                                onMouseEnter={() => setHoveredItem(index)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        <div
                                            className={cn(
                                                "flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-200 bg-gray-100 dark:bg-gray-900",
                                                hoveredItem === index && "scale-110",
                                            )}
                                        >
                                            <type.icon className="w-6 h-6 text-black dark:text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h3 className="font-semibold text-base text-black dark:text-white">{type.name}</h3>
                                                <Badge className="bg-indigo-600 text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                                                    Available
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="coming-soon" className="mt-0 space-y-4">
                        {comingSoonTypes.map((type, index) => (
                            <Card
                                key={index}
                                className={cn(
                                    "transition-all duration-200 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950",
                                    hoveredItem === index + 100 && "shadow-md",
                                )}
                                onMouseEnter={() => setHoveredItem(index + 100)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        <div
                                            className={cn(
                                                "flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-200 bg-gray-100 dark:bg-gray-900",
                                                hoveredItem === index + 100 && "scale-110",
                                            )}
                                        >
                                            <type.icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h3 className="font-semibold text-base text-gray-500 dark:text-gray-400">{type.name}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400"
                                                >
                                                    Coming Soon
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">{type.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}

