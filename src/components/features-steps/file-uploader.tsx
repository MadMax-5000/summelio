"use client"

import type React from "react"

import { useState } from "react"
import { Upload, File, X, Link } from "lucide-react"

interface FileUploaderProps {
    onFileUpload: (file: File) => void
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [url, setUrl] = useState("")

    // Non-functional handlers - just for UI display
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const removeFile = () => {
        setSelectedFile(null)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-6 py-10">
            {/* File Uploader Section - Centered */}
            <div className="w-full max-w-md">
                {!selectedFile ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${dragActive ? "border-indigo-500 bg-indigo-50" :
                                isHovering ? "border-indigo-500" : "border-gray-300"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Upload className={`h-12 w-12 ${isHovering ? "text-indigo-500" : "text-gray-400"} transition-colors duration-200`} />
                            <p className="text-sm font-medium text-gray-700">Drag and drop your PDF file here</p>
                            <p className="text-xs text-gray-500">Only PDF files are supported</p>
                        </div>
                    </div>
                ) : (
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <File className="h-8 w-8 text-indigo-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={removeFile} className="p-1 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* URL Input Section - Centered */}
            <div className="w-full max-w-md space-y-3">
                <div className="text-center text-sm text-gray-500">or</div>
                <div className="flex space-x-2">
                    <div className="flex-1 relative">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste Your Web Page URL here"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 text-sm"
                        />
                    </div>
                    <button
                        type="button"
                        className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-1 text-sm"
                    >
                        <Link className="h-3.5 w-3.5" />
                        <span>Add URL</span>
                    </button>
                </div>
            </div>
        </div>
    )
}