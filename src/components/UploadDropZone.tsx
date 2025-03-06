import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, LinkIcon } from "lucide-react";
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

  // Add the trpc mutation for file fetching
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  // Add trpc mutation for URL saving
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
    // Basic validation
    if (!urlInput.trim()) {
      return toast("Please enter a URL");
    }
    try {
      // Basic URL Validation
      new URL(urlInput); // This will throw if invalid

      // Reset file upload state if any
      setIsUploading(false);
      setUploadProgress(0);

      // Set URL upload state
      setIsUrlUploading(true);
      setProcessingUrl(urlInput);
      const progressInterval = startSimulatedProgress(setUrlUploadProgress);

      // Submit the URL to backend
      saveUrl({
        url: urlInput,
        name: new URL(urlInput).hostname,
      });

      // Let the progress finish to 100%
      setTimeout(() => {
        clearInterval(progressInterval);
        setUrlUploadProgress(100);
      }, 1500);

      // Clear the input
      setUrlInput("");
    } catch (error) {
      toast("Please enter a valid URL");
      setIsUrlUploading(false);
      setProcessingUrl("");
    }
  };

  // Disable the default click-to-upload behavior on the dropzone container
  const { getRootProps, getInputProps, acceptedFiles, isDragActive } =
    useDropzone({
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-10 transition-colors duration-200 ease-in-out bg-gray-50"
        style={{
          borderWidth: "4px",
          borderStyle: "dashed",
          borderSpacing: "20x",
        }}
      >
        {/* Hidden input element with getInputProps() */}
        <input {...getInputProps()} id="upload-input" className="hidden" />
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full pt-5 pb-6">
            <Upload className="h-8 w-8 text-gray-700 mb-2" />
            <p className="mb-2 text-base text-gray-700">
              {/* Clicking this label will trigger the hidden input */}
              <label
                htmlFor="upload-input"
                className="font-semibold underline cursor-pointer"
              >
                Click to upload
              </label>{" "}
              or drag and drop your PDF
            </p>
            <p className="text-gray-700 text-sm">Maximum file size 16MB.</p>
            <div className="mt-6 w-full">
              <p className="text-base text-gray-600 text-center">or</p>
              <form className="flex mt-2 w-full" onSubmit={handleUrlSubmit}>
                <div className="flex-1 min-w-0 mr-2">
                  <Input
                    type="text"
                    placeholder="Paste Your Web Page URL here"
                    className="w-full border-gray-200 focus:ring-gray-600 text-base"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isUploading || isUrlUploading}
                  />
                </div>
                <Button
                  type="submit"
                  className="text-white text-sm whitespace-nowrap flex-shrink-0 bg-indigo-500 hover:bg-indigo-600"
                  disabled={isUploading || isUrlUploading}
                >
                  <LinkIcon className="mr-2 h-4 w-4" /> Add URL
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* File upload progress card */}
      {isUploading && acceptedFiles && acceptedFiles[0] && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <File className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {acceptedFiles[0].name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(acceptedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <Progress
                      indicatorColor={
                        uploadProgress === 100 ? "bg-green-500" : "bg-black"
                      }
                      value={uploadProgress}
                      className="h-1 w-full bg-gray-100"
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[40px] text-right">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL upload progress card */}
      {isUrlUploading && processingUrl && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <LinkIcon className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {processingUrl}
                    </p>
                    <p className="text-sm text-gray-500">URL</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUrl();
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <Progress
                      indicatorColor={
                        urlUploadProgress === 100 ? "bg-green-500" : "bg-black"
                      }
                      value={urlUploadProgress}
                      className="h-1 w-full bg-gray-100"
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[40px] text-right">
                    {urlUploadProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDropZone;
