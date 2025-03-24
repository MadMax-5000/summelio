"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Globe,
    File,
    Youtube,
    ArrowRight,
    MoreHorizontal,
    Loader2,
    Download,
    Share2,
    Trash2,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Grid,
    List,
    ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { trpc } from "@/_trpc/client";
import Link from "next/link";

// Using the same interface from Dashboard.tsx
interface FileData {
    id: string;
    name: string;
    type: string;
    uploadStatus: string;
    createdAt: string;
}

export default function FilesPage() {
    const router = useRouter();
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);
    const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Use the same TRPC queries as in Dashboard.tsx
    const utils = trpc.useContext();
    const { data: files, isLoading } = trpc.getUserFiles.useQuery();
    const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery();

    // Check subscription and redirect if necessary (same as Dashboard.tsx)
    useEffect(() => {
        const checkSubscription = async () => {
            if (!isLoadingSubscription && subscription) {
                if (!subscription.isSubscribed) {
                    router.push("/#pricing");
                }
            }
        };

        checkSubscription();
    }, [subscription, isLoadingSubscription, router]);

    // Use the same delete mutation as in Dashboard.tsx
    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate();
        },
        onMutate({ id }) {
            setCurrentlyDeletingFile(id);
        },
        onSettled() {
            setCurrentlyDeletingFile(null);
        },
    });

    // Reuse handleChatWithAI function
    const handleChatWithAI = (fileId: string) => {
        setLoadingFileId(fileId);
        router.push(`/dashboard/${fileId}`);
    };

    // Helper functions from Dashboard.tsx
    const truncateName = (name: string) =>
        name.split(/\s+/).length > 4 ? name.split(/\s+/).slice(0, 4).join(" ") + "..." : name;

    // Helper function to determine styling based on upload status
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return "success";
            case "FAILED":
                return "destructive";
            case "PROCESSING":
                return "warning";
            case "PENDING":
            default:
                return "secondary";
        }
    };

    // Filter and sort files
    const filteredFiles = files
        ? files
            .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()) || file.type.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a: FileData, b: FileData) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            })
        : [];

    // File type icon mapping
    const getFileIcon = (type: string, size = "small") => {
        const iconSize = size === "small" ? "h-3.5 w-3.5" : "h-5 w-5";

        switch (type) {
            case "Web Page":
                return <Globe className={iconSize} />;
            case "pdf":
                return <File className={iconSize} />;
            case "Youtube Video":
                return <Youtube className={iconSize} />;
            default:
                return <File className={iconSize} />;
        }
    };

    // Generate file type-based color
    const getTypeColor = (type: string) => {
        switch (type) {
            case "Web Page":
                return "bg-blue-100 text-blue-600";
            case "pdf":
                return "bg-red-100 text-red-600";
            case "Youtube Video":
                return "bg-pink-100 text-pink-900";
            default:
                return "bg-gray-100 text-gray-900";
        }
    };

    if (!isLoadingSubscription && subscription && !subscription.isSubscribed) {
        return null;
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex flex-col mt-2 fixed top-0 left-0 right-0 z-50">
                <nav className="flex items-center bg-white text-black px-4 py-3 space-x-2 relative border-b border-gray-300">
                    <Link href="/dashboard" className="text-base font-medium hover:underline">
                        Dashboard
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-base font-medium">Files</span>
                </nav>
            </div>
            <div className="flex flex-col min-h-screen w-full bg-background pt-14">
                <main className="flex-1 p-4 space-y-4 max-w-full">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex items-center space-x-2 w-full md:w-1/3">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search files..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <span>Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSearchQuery("")}>
                                        All Files
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSearchQuery("pdf")}>
                                        PDF Documents
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSearchQuery("Web Page")}>
                                        Web Pages
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSearchQuery("Youtube Video")}>
                                        YouTube Videos
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                            >
                                {sortDirection === "asc" ? (
                                    <SortAsc className="mr-2 h-4 w-4" />
                                ) : (
                                    <SortDesc className="mr-2 h-4 w-4" />
                                )}
                                <span>Sort</span>
                            </Button>

                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="px-4 py-3 border-b">
                            <CardTitle className="text-[17px] font-medium">All Files</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className={viewMode === "grid" ? "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4" : ""}>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            viewMode === "grid" ? (
                                                <Card key={index} className="overflow-hidden border border-border">
                                                    <div className="p-6">
                                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                    <div className="px-6 pb-4 flex justify-between items-center">
                                                        <Skeleton className="h-6 w-24" />
                                                        <Skeleton className="h-8 w-32" />
                                                    </div>
                                                </Card>
                                            ) : (
                                                <div key={index} className="flex items-center justify-between p-4 border-b">
                                                    <div className="flex flex-col space-y-1">
                                                        <Skeleton className="h-6 w-64" />
                                                        <Skeleton className="h-4 w-40" />
                                                    </div>
                                                    <Skeleton className="h-8 w-32" />
                                                </div>
                                            )
                                        ))}
                                </div>
                            ) : filteredFiles.length > 0 ? (
                                viewMode === "grid" ? (
                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
                                        {filteredFiles.map((file) => (
                                            <Card key={file.id} className="overflow-hidden border border-border hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`p-2 rounded-lg ${getTypeColor(file.type)}`}>
                                                                {getFileIcon(file.type, "large")}
                                                            </div>
                                                            <Badge
                                                                variant={getStatusBadgeVariant(file.uploadStatus) as any}
                                                                className="font-medium text-[13px]"
                                                            >
                                                                {file.uploadStatus}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(file.createdAt), "MMM dd, yyyy")}
                                                            </span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">More options</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => deleteFile({ id: file.id })}
                                                                        disabled={currentlyDeletingFile === file.id}
                                                                    >
                                                                        {currentlyDeletingFile === file.id ? (
                                                                            <Loader variant="circular" />
                                                                        ) : (
                                                                            <span>Delete</span>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium text-[15px] mb-1 truncate" title={file.name}>
                                                                {truncateName(file.name)}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">{file.type}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 text-[15px] font-medium "
                                                            onClick={() => handleChatWithAI(file.id)}
                                                            disabled={loadingFileId === file.id}
                                                        >
                                                            {loadingFileId === file.id ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Loader className="w-4 h-4" variant="classic" />
                                                                    <span>Loading...</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span>Chat with AI</span>
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        {filteredFiles.map((file, index) => (
                                            <div
                                                key={file.id}
                                                className={`flex items-center justify-between p-4 hover:bg-muted/40 ${index !== filteredFiles.length - 1 ? "border-b border-border" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-lg ${getTypeColor(file.type)}`}>
                                                        {getFileIcon(file.type, "large")}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-[15px] mb-1" title={file.name}>
                                                            {truncateName(file.name)}
                                                        </h3>
                                                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                                            <span>{file.type}</span>
                                                            <span>•</span>
                                                            <span>{format(new Date(file.createdAt), "MMM dd, yyyy")}</span>
                                                            <span>•</span>
                                                            <Badge
                                                                variant={getStatusBadgeVariant(file.uploadStatus) as any}
                                                                className="font-normal text-[13px]"
                                                            >
                                                                {file.uploadStatus}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-3 text-[15px] font-medium"
                                                        onClick={() => handleChatWithAI(file.id)}
                                                        disabled={loadingFileId === file.id}
                                                    >
                                                        {loadingFileId === file.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <Loader className="w-4 h-4" variant="classic" />
                                                                <span>Loading...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span>Chat with AI</span>
                                                                <ArrowRight className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">More options</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => deleteFile({ id: file.id })}
                                                                disabled={currentlyDeletingFile === file.id}
                                                            >
                                                                {currentlyDeletingFile === file.id ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <span>Delete</span>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <File className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-1">No files found</h3>
                                    <p className="text-[15px] text-muted-foreground mb-4">
                                        {searchQuery ? "Try adjusting your search query" : "No uploads yet. Start by adding some content!"}
                                    </p>
                                    {searchQuery && (
                                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarProvider>
    );
}