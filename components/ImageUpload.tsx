"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileDown, ImageIcon, Loader2, Upload, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import type { FileRejection } from "react-dropzone"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import type React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"

export default function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  // Simulate progress during loading
  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval)
          return prevProgress
        }
        return prevProgress + 10
      })
    }, 500)

    return () => clearInterval(interval)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (file && !allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PNG, JPG, or JPEG image.",
      })
      return
    }
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        generateImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const generateImage = async (imageData: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setGeneratedImage(null)
      setActiveTab("result")

      // Start progress simulation
      const clearProgressSimulation = simulateProgress()

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })

      // Clear progress simulation
      clearProgressSimulation()
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image")
    } finally {
      setIsLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
    preventDropOnDocument: true,
  })

  // Handle rejection when fileRejections change
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0] as FileRejection
      const error = rejection.errors[0]
      if (error.code === "file-invalid-type") {
        toast.error("Invalid file type", {
          description: "Please upload a PNG, JPG, or JPEG image.",
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
      } else if (error.code === "too-many-files") {
        toast.error("Too many files", { 
          description: "Please upload only one image at a time.",
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
      } else {
        toast.error("Upload failed", { 
          description: "Please try again with a different image.",
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
      }
    }
  }, [fileRejections])

  const handleExport = (format: string) => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = `data:image/jpeg;base64,${generatedImage}`
    link.download = `generated-image.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetUpload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setPreview(null)
    setGeneratedImage(null)
    setError(null)
    setActiveTab("upload")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="result" disabled={!preview}>
              Result
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6">
          <TabsContent value="upload" className="mt-0">
            <div
              {...getRootProps()}
              className={`relative group transition-all duration-300 ease-in-out
                ${
                  preview
                    ? "h-64 rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                    : "border-2 border-dashed rounded-lg p-8 h-64 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900"
                } ${isDragActive ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-neutral-200 dark:border-neutral-800"}`}
            >
              <input {...getInputProps()} aria-label="Upload image" />

              {preview ? (
                <>
                  <div className="relative w-full h-full">
                    <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="absolute top-2 right-2 bg-neutral-900/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-800 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    {isDragActive ? (
                      <Upload className="w-8 h-8 text-primary animate-pulse" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary/80" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                      {isDragActive ? "Drop to upload" : "Drag image here or click to upload"}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">PNG, JPG, JPEG</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="result" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <svg className="w-16 h-16 rotate-[-90deg]" viewBox="0 0 100 100">
                      <circle
                        className="text-neutral-100 dark:text-neutral-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (progress / 100) * 264}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Generating your image</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">This may take a moment...</p>
                  </div>
                  <Progress value={progress} className="w-full max-w-xs" />
                </div>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex flex-col items-center">
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={resetUpload}>
                  Try Again
                </Button>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative h-64 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <Image
                    src={`data:image/jpeg;base64,${generatedImage}`}
                    alt="Generated image"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => handleExport("jpg")}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as JPG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("png")}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as PNG
                  </Button>
                  <Button variant="default" size="sm" onClick={resetUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

