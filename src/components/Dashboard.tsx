"use client"
import { AppSidebar } from "./app-sidebar"
import { Globe, File, Loader2, Youtube, MoreHorizontal, ExternalLink } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import UploadDropZone from "./UploadDropZone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { trpc } from "@/_trpc/client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Define interfaces for your data structures
interface FileData {
  id: string
  name: string
  type: string
  uploadStatus: string
  createdAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null)
  const utils = trpc.useContext()
  const { data: files, isLoading } = trpc.getUserFiles.useQuery()
  const { data: subscription, isLoading: isLoadingSubscription } = trpc.getUserSubscription.useQuery()

  // Check subscription and redirect if necessary
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isLoadingSubscription && subscription) {
        if (!subscription.isSubscribed) {
          router.push("/#pricing")
        }
      }
    }

    checkSubscription()
  }, [subscription, isLoadingSubscription, router])

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })

  const handleChatWithAI = (fileId: string) => {
    setLoadingFileId(fileId)
    router.push(`/dashboard/${fileId}`)
  }

  const truncateName = (name: string) =>
    name.split(/\s+/).length > 7 ? name.split(/\s+/).slice(0, 7).join(" ") + "..." : name

  // Helper function to determine styling based on upload status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "success"
      case "FAILED":
        return "destructive"
      case "PROCESSING":
        return "warning"
      case "PENDING":
      default:
        return "secondary"
    }
  }

  // If not subscribed, don't render the dashboard content
  if (!isLoadingSubscription && subscription && !subscription.isSubscribed) {
    return null // Will be redirected by the useEffect
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col min-h-screen w-full bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 sm:px-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-[16px] font-medium">Content Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 p-4 space-y-4 max-w-full">
          <div className="grid gap-4 w-full">
            <Card className="border-border shadow-sm w-full">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-[16px] font-medium">Upload Content</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <UploadDropZone />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-[16px] font-medium">Recent Uploads</CardTitle>
              </CardHeader>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="w-[300px] font-medium text-[13px] uppercase text-muted-foreground">
                        File name
                      </TableHead>
                      <TableHead className="font-medium text-[13px] uppercase text-muted-foreground">Type</TableHead>
                      <TableHead className="font-medium text-[13px] uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="font-medium text-[13px] uppercase text-muted-foreground">
                        Date uploaded
                      </TableHead>
                      <TableHead className="text-right font-medium text-[13px] uppercase text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files && files.length !== 0 ? (
                      files
                        .sort(
                          (a: FileData, b: FileData) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                        )
                        .map((file: FileData) => (
                          <TableRow key={file.id} className="hover:bg-muted/40 border-b border-border last:border-none">
                            <TableCell className="font-medium text-[16px]">{truncateName(file.name)}</TableCell>
                            <TableCell className="text-[16px] text-muted-foreground">
                              {file.type === "Web Page" ? (
                                <div className="flex items-center gap-1.5">
                                  <Globe className="h-3.5 w-3.5" />
                                  <span>{file.type}</span>
                                </div>
                              ) : file.type === "pdf" ? (
                                <div className="flex items-center gap-1.5">
                                  <File className="h-3.5 w-3.5" />
                                  <span>{file.type}</span>
                                </div>
                              ) : file.type === "Youtube Video" ? (
                                <div className="flex items-center gap-1.5">
                                  <Youtube className="h-3.5 w-3.5" />
                                  <span>{file.type}</span>
                                </div>
                              ) : (
                                file.name
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(file.uploadStatus) as any}
                                className="font-normal text-[13px]"
                              >
                                {file.uploadStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[16px] text-muted-foreground">
                              {format(new Date(file.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-[16px] font-medium"
                                  onClick={() => handleChatWithAI(file.id)}
                                  disabled={loadingFileId === file.id}
                                >
                                  {loadingFileId === file.id ? (
                                    <div className="flex items-center gap-1.5">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Loading...</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <ExternalLink className="h-3 w-3" />
                                      <span>Chat with AI</span>
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
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <span>Delete</span>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-6 w-[250px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-[100px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-[80px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-[100px]" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-8 w-[100px] ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-[16px] text-muted-foreground">
                          No uploads yet. Start by adding some content!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

