"use client";
import Link from "next/link";
import { AppSidebar } from "./app-sidebar";
import { Globe, File, Loader2, Youtube } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Skeleton from "react-loading-skeleton";
import UploadDropZone from "./UploadDropZone";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/_trpc/client";
import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

// Define interfaces for your data structures
interface FileData {
  id: string;
  name: string;
  type: string;
  uploadStatus: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const utils = trpc.useContext();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
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

  const handleChatWithAI = (fileId: string) => {
    setLoadingFileId(fileId);
    router.push(`/dashboard/${fileId}`);
  };

  const truncateName = (name: string) =>
    name.split(/\s+/).length > 7
      ? name.split(/\s+/).slice(0, 7).join(" ") + "..."
      : name;

  // Helper function to determine styling based on upload status
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-900";
      case "FAILED":
        return "bg-red-100 text-red-900";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-900";
      case "PENDING":
      default:
        return "bg-orange-100 text-orange-900";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="container mx-auto p-6 max-w-5xl">
        <Card className="w-full overflow-hidden border-gray-200 shadow-md">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Content Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <UploadDropZone />
          </CardContent>
          <CardFooter className="bg-white px-6 py-8">
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Recent Uploads
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 text-[15px] font-normal text-gray-800">
                      <TableHead className="text-gray-700">File name</TableHead>
                      <TableHead className="text-gray-700">Type</TableHead>
                      <TableHead className="text-gray-700">Status</TableHead>
                      <TableHead className="text-gray-700">
                        Date uploaded
                      </TableHead>
                      <TableHead className="text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files && files.length !== 0 ? (
                      files
                        .sort(
                          (a: FileData, b: FileData) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((file: FileData) => (
                          <TableRow
                            key={file.id}
                            className="border-b border-gray-200 last:border-none"
                          >
                            <TableCell className="text-base text-gray-700">
                              {truncateName(file.name)}
                            </TableCell>
                            <TableCell className="text-base text-gray-700">
                              {file.type === "Web Page" ? (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-4 w-4" />
                                  <span>{file.type}</span>
                                </div>
                              ) : file.type === "pdf" ? (
                                <div className="flex items-center gap-1">
                                  <File className="h-4 w-4" />
                                  <span>{file.type}</span>
                                </div>
                              ) : file.type === "Youtube Video" ? (
                                <div className="flex items-center gap-1">
                                  <Youtube className="h-4 w-4" />
                                  <span>{file.type}</span>
                                </div>
                              ) : (
                                file.name
                              )}
                            </TableCell>
                            <TableCell className="text-base text-gray-700">
                              <span
                                className={`px-2 py-1 rounded ${getStatusClasses(
                                  file.uploadStatus
                                )}`}
                              >
                                {file.uploadStatus}
                              </span>
                            </TableCell>
                            <TableCell className="text-base text-gray-700">
                              {format(new Date(file.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            {/* Single Action column for both buttons */}
                            <TableCell className="text-base text-gray-700">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  className="border-gray-300 text-white text-base px-3 py-1.5 hover:bg-indigo-600 bg-indigo-500 hover:text-white"
                                  onClick={() => handleChatWithAI(file.id)}
                                  disabled={loadingFileId === file.id}
                                >
                                  {loadingFileId === file.id ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Loading...</span>
                                    </div>
                                  ) : (
                                    "Chat with AI"
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 text-base px-3 py-1.5 hover:bg-red-300 hover:text-white"
                                  onClick={() => deleteFile({ id: file.id })}
                                  disabled={
                                    currentlyDeletingFile === file.id ||
                                    loadingFileId === file.id
                                  }
                                >
                                  {currentlyDeletingFile === file.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <span>Delete</span>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <Skeleton height={30} count={7} className="my-2 " />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-[15px] font-normal text-gray-800"
                        >
                          No uploads yet. Start by adding some content!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </SidebarProvider>
  );
}