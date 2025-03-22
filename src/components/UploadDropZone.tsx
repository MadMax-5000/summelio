import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, LinkIcon, CloudUpload } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/_trpc/client";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const UploadDropZone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [urlInput, setUrlInput] = useState<string>("");
  const [isUrlUploading, setIsUrlUploading] = useState<boolean>(false);
  const [urlUploadProgress, setUrlUploadProgress] = useState<number>(0);
  const [processingUrl, setProcessingUrl] = useState<string>("");
  const { startUpload } = useUploadThing("fileuploader");

  // Mutation for file fetching
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  // Mutation for URL saving
  const { mutate: saveUrl } = trpc.saveUrlAsFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
  });

  const startSimulatedProgress = (
    setProgressFn: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setProgressFn(0);
    const interval = setInterval(() => {
      setProgressFn((prevProgress: number) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      setIsUrlUploading(false);
      setProcessingUrl("");
      const progressInterval = startSimulatedProgress(setUploadProgress);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await startUpload(acceptedFiles);
      clearInterval(progressInterval);
      if (!res) {
        setIsUploading(false);
        return toast("Something went wrong");
      }
      const [fileResponse] = res;
      const key = fileResponse?.key;
      if (!key) {
        setIsUploading(false);
        return toast("Something went wrong");
      }
      setUploadProgress(100);
      startPolling({ key });
    },
    [startUpload, startPolling]
  );

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      return toast("Please enter a URL");
    }
    try {
      const url = new URL(urlInput);
      setIsUploading(false);
      setUploadProgress(0);
      setIsUrlUploading(true);
      setProcessingUrl(urlInput);
      const progressInterval = startSimulatedProgress(setUrlUploadProgress);

      saveUrl({
        url: urlInput,
        name: url.hostname,
      });

      setTimeout(() => {
        clearInterval(progressInterval);
        setUrlUploadProgress(100);
      }, 1500);
      setUrlInput("");
    } catch (error) {
      toast("Please enter a valid URL");
      setIsUrlUploading(false);
      setProcessingUrl("");
    }
  };

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
  });

  const handleRemoveFile = useCallback(() => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      const event = new Event("drop", { bubbles: true });
      fileInput.dispatchEvent(event);
      (fileInput as HTMLInputElement).value = "";
    }
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleRemoveUrl = useCallback(() => {
    setIsUrlUploading(false);
    setUrlUploadProgress(0);
    setProcessingUrl("");
  }, []);

  return (
    <div className="space-y-2">
      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <input {...getInputProps()} id="upload-input" className="hidden" />
        <div className="flex flex-col items-center justify-center">
          <CloudUpload className="h-8 w-8 text-gray-900 dark:text-gray-400 mb-4" />
          <p className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-200">
            Drop your PDF here
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Or{"   "}
            <label
              htmlFor="upload-input"
              className="text-black hover:underline cursor-pointer underline font-medium"
            >
              click to upload
            </label>
          </p>
          <div className="w-full mt-8">
            <p className="text-center text-base text-gray-600 dark:text-gray-400">
              OR
            </p>
            <form className="mt-4 flex gap-4" onSubmit={handleUrlSubmit}>
              <Input
                type="text"
                placeholder="Enter a URL or YouTube Video link here"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isUploading || isUrlUploading}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
              />
              <Button
                type="submit"
                disabled={isUploading || isUrlUploading}
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-base"
              >
                <LinkIcon className="h-5 w-5" /> Add URL
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* File Upload Progress Card */}
      {isUploading && acceptedFiles && acceptedFiles[0] && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
          <div className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-3 dark:bg-gray-800 rounded-lg">
                  <File className="h-4 w-7 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {acceptedFiles[0].name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(acceptedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="mt-6 flex items-center">
              <Progress
                indicatorColor={
                  uploadProgress === 100 ? "bg-green-500" : "bg-black"
                }
                value={uploadProgress}
                className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full"
              />
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                {uploadProgress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* URL Upload Progress Card */}
      {isUrlUploading && processingUrl && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-3 dark:bg-gray-800 rounded-lg">
                  <LinkIcon className="h-4 w-4 text-gray-900 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {processingUrl}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    URL
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUrl();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="mt-6 flex items-center">
              <Progress
                indicatorColor={
                  urlUploadProgress === 100 ? "bg-green-500" : "bg-black"
                }
                value={urlUploadProgress}
                className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full"
              />
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                {urlUploadProgress}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDropZone;
