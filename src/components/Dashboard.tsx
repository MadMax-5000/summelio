"use client";
import Link from "next/link";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Skeleton from "react-loading-skeleton";
import UploadDropZone from "./UploadDropZone";
import { Loader2 } from "lucide-react";
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

export default function Dashboard() {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
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
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Content Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <UploadDropZone />
          </CardContent>
          <CardFooter className="bg-white px-6 py-8">
            <div className="w-full">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Recent Uploads
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 text-base">
                      <TableHead className="text-gray-700">File name</TableHead>
                      <TableHead className="text-gray-700">Type</TableHead>
                      <TableHead className="text-gray-700">Status</TableHead>
                      <TableHead className="text-gray-700">
                        Date uploaded
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files && files.length !== 0 ? (
                      files
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((file) => (
                          <TableRow
                            key={file.id}
                            className="border-b border-gray-200 last:border-none"
                          >
                            <TableCell className="text-base text-gray-700">
                              {truncateName(file.name)}
                            </TableCell>
                            <TableCell className="text-base text-gray-700">
                              {file.type}
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
                                <Link href={`/dashboard/${file.id}`}>
                                  <Button
                                    variant="outline"
                                    className="border-gray-300 text-white text-base px-3 py-1.5 hover:bg-indigo-600 bg-indigo-500 hover:text-white "
                                  >
                                    Chat with AI
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 text-base px-3 py-1.5 hover:bg-red-300 hover:text-white"
                                  onClick={() => deleteFile({ id: file.id })}
                                  disabled={currentlyDeletingFile === file.id}
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
                        <TableCell colSpan={4} className="text-center">
                          <Skeleton height={30} count={7} className="my-2 " />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-base text-gray-700"
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
