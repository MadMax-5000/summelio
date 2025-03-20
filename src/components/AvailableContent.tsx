"use client"

import { useState } from "react"
import {
    Youtube,
    Globe,
    FileText,
    FileIcon,
    FileSpreadsheet,
    FileIcon as FilePresentation,
    Music,
    BookOpen,
    CheckCircle,
    Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function ContentTypes() {
    const [hoveredItem, setHoveredItem] = useState<number | null>(null)

    const availableTypes = [
        {
            name: "YouTube Videos",
            icon: Youtube,
            color: "bg-indigo-600",
        },
        {
            name: "Web Pages",
            icon: Globe,
            color: "bg-indigo-600",
        },
        {
            name: "PDF Documents",
            icon: FileText,
            color: "bg-indigo-600",
        },
    ]

    const comingSoonTypes = [
        {
            name: "Word Documents",
            icon: FileIcon,
            description: "Support for Microsoft Word documents and google Docs ",
        },
        {
            name: "Excel Spreadsheets",
            icon: FileSpreadsheet,
            description: "Support for Microsoft Excel documents and google Sheets",
        },
        {
            name: "PowerPoint",
            icon: FilePresentation,
            description: "Support for Microsoft PowerPoint documents and google Slides",
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
        <section className="py-12 px-1 md:px-2 bg-gray-50 from-indigo-50/50 via-background to-background dark:from-indigo-950/10 dark:via-background dark:to-background">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 text-xs font-medium tracking-wider uppercase mb-3">
                        NEW TYPES ADDED 🎉
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Supported Content Types</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Easily chat with different content formats in one App
                    </p>
                </div>

                <Tabs defaultValue="available" className="w-full">
                    <div className="flex justify-center mb-6">
                        <TabsList className="flex w-full max-w-md items-center bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <TabsTrigger
                                value="available"
                                className="flex-1 text-center py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-l-md transition-colors"
                            >
                                <CheckCircle className="w-4 h-4 mr-2 inline" />
                                Available Now
                            </TabsTrigger>
                            <TabsTrigger
                                value="coming-soon"
                                className="flex-1 text-center py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-r-md transition-colors"
                            >
                                <Clock className="w-4 h-4 mr-2 inline" />
                                Coming Soon
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    <TabsContent value="available" className="mt-0">
                        <div className="grid gap-4 md:gap-6">
                            {availableTypes.map((type, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                                        "hover:shadow-sm",
                                        hoveredItem === index ? "bg-muted/50" : "bg-card/50",
                                    )}
                                    onMouseEnter={() => setHoveredItem(index)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div
                                        className={cn(
                                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                                            type.color,
                                            "transform transition-transform duration-300",
                                            hoveredItem === index ? "scale-110" : "",
                                        )}
                                    >
                                        <type.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <h3 className="font-medium">{type.name}</h3>
                                            <Badge className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 w-fit">
                                                Available
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="coming-soon" className="mt-0">
                        <div className="grid gap-4 md:gap-6">
                            {comingSoonTypes.map((type, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                                        "border-muted",
                                        "hover:shadow-sm",
                                        hoveredItem === index + 100 ? "bg-muted/30" : "bg-card/30",
                                    )}
                                    onMouseEnter={() => setHoveredItem(index + 100)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div
                                        className={cn(
                                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-muted/70",
                                            "transform transition-transform duration-300",
                                            hoveredItem === index + 100 ? "scale-110" : "",
                                        )}
                                    >
                                        <type.icon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <h3 className="font-medium text-muted-foreground">{type.name}</h3>
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-200 bg-indigo-50/50 text-indigo-500 dark:border-indigo-900/20 dark:bg-indigo-900/10 dark:text-indigo-300 w-fit"
                                            >
                                                Coming Soon
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground/80 mt-1">{type.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>

    )
}

