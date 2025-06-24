"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PhotoGalleryDialogProps {
  worker: any
  onClose: () => void
}

export default function PhotoGalleryDialog({ worker, onClose }: PhotoGalleryDialogProps) {
  const supabaseContext = useSupabase()
  const { toast } = useToast()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchPhotos = async () => {
      try {
        console.log("🚀 Fetching photos for:", worker?.full_name)
        console.log("🔍 Supabase context:", !!supabaseContext)
        console.log("🔍 Supabase client:", !!supabaseContext?.supabase)

        if (!worker?.id) throw new Error("No worker provided")
        if (!supabaseContext?.supabase) throw new Error("Supabase client not available")

        const { supabase } = supabaseContext
        const allPhotos: string[] = []

        // Add profile picture if exists
        if (worker.profile_picture_url) {
          allPhotos.push(worker.profile_picture_url)
          console.log("📸 Added profile picture")
        }

        if (!supabase.storage) throw new Error("Supabase storage not available")

        const { data: files, error: storageError } = await supabase.storage
          .from("worker-photos")
          .list("", { limit: 50 })

        if (storageError) throw new Error(`Storage error: ${storageError.message}`)

        if (files && files.length > 0) {
          const firstName = worker.full_name?.split(" ")[0]?.toLowerCase() || ""
          const matchedFiles = files.filter((file) => {
            const fileName = file.name.toLowerCase()
            const isImage = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")
            const matches = fileName.startsWith(firstName)

            if (matches && isImage) console.log(`✅ Matched file: ${file.name}`)
            return matches && isImage
          })

          const workerPhotos = await Promise.all(
            matchedFiles.map(async (file) => {
              const { data } = supabase.storage.from("worker-photos").getPublicUrl(file.name)
              console.log(`🔗 Generated URL: ${data.publicUrl}`)
              try {
                const response = await fetch(data.publicUrl, { method: "HEAD" })
                console.log(`🧪 URL test for ${file.name}: ${response.ok ? "OK" : "FAILED"} (${response.status})`)
              } catch (error) {
                console.log(`🧪 URL test for ${file.name}: NETWORK ERROR`)
              }
              return data.publicUrl
            })
          )

          allPhotos.push(...workerPhotos)
        } else {
          console.log("📂 No files found in storage")
        }

        if (isMounted) {
          const uniquePhotos = [...new Set(allPhotos)]
          setPhotos(uniquePhotos)
          console.log(`✅ Set ${uniquePhotos.length} photos`)
        }
      } catch (err: any) {
        console.error("❌ Error:", err.message)
        if (isMounted) {
          setError(err.message)
          toast({ title: "Error loading photos", description: err.message, variant: "destructive" })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const timer = setTimeout(() => fetchPhotos(), 100)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [supabaseContext, worker?.full_name])

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  const goToPhoto = (index: number) => setCurrentPhotoIndex(index)

  const downloadPhoto = () => {
    if (photos[currentPhotoIndex]) {
      const link = document.createElement("a")
      link.href = photos[currentPhotoIndex]
      link.download = `${worker.full_name}-photo-${currentPhotoIndex + 1}.jpg`
      link.click()
    }
  }

  if (loading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{worker?.full_name || "Worker"} - Photo Gallery</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading photos...</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{worker?.full_name || "Worker"} - Photo Gallery</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">Error loading photos</div>
          <div className="text-sm text-muted-foreground text-center max-w-md">{error}</div>
          <div className="text-xs text-muted-foreground">
            Debug: Supabase available: {supabaseContext?.supabase ? "Yes" : "No"}
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{worker?.full_name || "Worker"} - Photo Gallery</span>
          <Badge variant="outline">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {photos.length > 0 ? (
          <>
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
              <div>Photo {currentPhotoIndex + 1} of {photos.length}</div>
              <div className="truncate">URL: {photos[currentPhotoIndex]}</div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photos[currentPhotoIndex] || "/placeholder.svg"}
                  alt={`${worker?.full_name} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log("✅ Photo loaded successfully")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    console.error("❌ Photo failed to load:", photos[currentPhotoIndex])
                    if (target.src !== "/images/placeholder-user.jpg") {
                      target.src = "/images/placeholder-user.jpg"
                    }
                  }}
                />
              </div>

              {photos.length > 1 && (
                <>
                  <Button variant="outline" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevPhoto}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextPhoto}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {photos.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} of {photos.length}
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentPhotoIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={photo || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src !== "/images/placeholder-user.jpg") {
                        target.src = "/images/placeholder-user.jpg"
                      }
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {worker?.full_name} • {worker?.area} • Rating: {worker?.rating || 0}/5
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={downloadPhoto}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No photos available for this worker.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Looking for files like: {worker?.full_name?.split(" ")[0].toLowerCase()}-1.jpeg, -2.jpeg, -3.jpeg...
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
