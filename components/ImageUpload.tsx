"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileDown, ImageIcon, Loader2, RefreshCcw, Upload, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"

type ImageState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  preview: string | null;
  generated: string | null;
  progress: number;
  error: string | null;
}

export default function ImageUpload() {
  const [imageState, setImageState] = useState<ImageState>({
    status: 'idle',
    preview: null,
    generated: null,
    progress: 0,
    error: null
  })
  const [activeTab, setActiveTab] = useState<"upload" | "result">("upload")
  
  const simulateProgress = useCallback(() => {
    setImageState(prev => ({ ...prev, progress: 0 }))
    const interval = setInterval(() => {
      setImageState(prev => {
        if (prev.progress >= 90) {
          clearInterval(interval)
          return prev
        }
        return { ...prev, progress: prev.progress + 10 }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const generateImage = useCallback(async (imageData: string) => {
    try {
      setImageState(prev => ({ ...prev, status: 'loading', error: null, generated: null }))
      setActiveTab("result")
      
      const clearProgressSimulation = simulateProgress()

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: imageData,
        }),
      })

      clearProgressSimulation()
      setImageState(prev => ({ ...prev, progress: 100 }))

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setImageState(prev => ({ ...prev, status: 'success', generated: data.response }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image"
      setImageState(prev => ({ ...prev, status: 'error', error: errorMessage }))
      toast.error("Failed to generate image", {
        description: "Please try again with a different image."
      })
    }
  }, [simulateProgress])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PNG, JPG, or JPEG image."
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const preview = reader.result as string
      setImageState(prev => ({ ...prev, preview }))
      generateImage(preview)
    }
    reader.readAsDataURL(file)
  }, [generateImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    onDropRejected: (fileRejections) => {
      if (fileRejections.length === 0) return
      
      const error = fileRejections[0].errors[0]
      if (error.code === "file-invalid-type") {
        toast.error("Invalid file type", {
          description: "Please upload a PNG, JPG, or JPEG image."
        })
      } else if (error.code === "too-many-files") {
        toast.error("Too many files", { 
          description: "Please upload only one image at a time."
        })
      } else {
        toast.error("Upload failed", { 
          description: "Please try again with a different image."
        })
      }
    }
  })

  const handleExport = (format: string) => {
    if (!imageState.generated) return

    const link = document.createElement("a")
    link.href = `data:image/jpeg;base64,${imageState.generated}`
    link.download = `generated-image.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetUpload = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setImageState({
      status: 'idle',
      preview: null,
      generated: null,
      progress: 0,
      error: null
    })
    setActiveTab("upload")
  }, [])

  const handleRetry = useCallback(() => {
    if (!imageState.preview) {
      toast.error("No image uploaded", {
        description: "Please upload an image first."
      })
      return
    }

    generateImage(imageState.preview)
  }, [imageState.preview, generateImage])

  const { preview, generated, status, progress, error } = imageState

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "upload" | "result")} className="w-full">
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="result" disabled={!preview}>Result</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6">
          <TabsContent value="upload" className="mt-0">
            <div
              {...getRootProps()}
              className={`relative group transition-all ${
                preview
                  ? "h-64 rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                  : "border-2 border-dashed rounded-lg p-8 h-64 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900"
              } ${isDragActive ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-neutral-200 dark:border-neutral-800"}`}
            >
              <input {...getInputProps()} aria-label="Upload image" />

              {preview ? (
                <>
                  <div className="relative w-full h-full">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
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
            {status === 'loading' && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-16 h-16">
                    <Loader2 className="absolute inset-0 w-8 h-8 m-auto text-primary animate-spin" />
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
                    <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                      Removing watermarks & generating image
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">This may take a moment...</p>
                  </div>
                  <Progress value={progress} className="w-full max-w-xs" />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex flex-col items-center">
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={resetUpload}>Try Again</Button>
              </div>
            )}

            {status === 'success' && generated && (
              <div className="space-y-4">
                <div className="relative h-64 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <Image
                    src={`data:image/jpeg;base64,${generated}`}
                    alt="Generated image"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Export Options</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport("jpg")} className="min-w-26">
                        <FileDown className="w-4 h-4 mr-2" />
                        JPG
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport("png")} className="min-w-26">
                        <FileDown className="w-4 h-4 mr-2" />
                        PNG
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Actions</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleRetry}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                      <Button variant="default" size="sm" onClick={resetUpload}>
                        <Upload className="w-4 h-4 mr-2" />
                        New Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'idle' && (
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

