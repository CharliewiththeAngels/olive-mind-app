"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Ruler,
  Shirt,
  Star,
  DollarSign,
  FileText,
  MessageSquare,
  Images,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface ViewWorkerDialogProps {
  worker: any
  onClose: () => void
}

export default function ViewWorkerDialog({ worker, onClose }: ViewWorkerDialogProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const photos = worker.profile_pictures || []

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Worker Profile</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Profile Section with Photo Gallery */}
        <div className="flex items-start space-x-6">
          {/* Photo Gallery */}
          <div className="flex-shrink-0">
            {photos.length > 0 ? (
              <div className="space-y-3">
                {/* Main Photo */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photos[currentPhotoIndex] || "/placeholder.svg"}
                      alt={`${worker.full_name} - Photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Navigation for multiple photos */}
                  {photos.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={prevPhoto}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={nextPhoto}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                        {currentPhotoIndex + 1}/{photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Photo thumbnails */}
                {photos.length > 1 && (
                  <div className="flex space-x-1">
                    {photos.slice(0, 3).map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-8 h-8 rounded overflow-hidden border transition-all ${
                          index === currentPhotoIndex
                            ? "border-primary ring-1 ring-primary/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {photos.length > 3 && (
                      <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{photos.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center text-xs text-muted-foreground">
                  <Images className="h-3 w-3 mr-1" />
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </div>
              </div>
            ) : (
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg" alt={worker.full_name} />
                <AvatarFallback className="text-2xl">
                  {worker.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Worker Info */}
          <div className="space-y-2 flex-1">
            <h3 className="text-2xl font-semibold">{worker.full_name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={worker.work_contract_signed ? "default" : "destructive"}>
                {worker.work_contract_signed ? "Contract Signed" : "Contract Pending"}
              </Badge>
              <div className="flex items-center space-x-1">
                {renderStars(worker.rating)}
                <span className="text-sm ml-1">{worker.rating}/5</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Worker ID: {worker.id}</p>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{worker.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{worker.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">WhatsApp: {worker.whatsapp_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Area: {worker.area}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Age: {worker.age}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Ruler className="h-5 w-5 mr-2" />
                Physical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Height: {worker.height}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shirt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Dress Size: {worker.dress_size}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shirt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Top Size: {worker.top_size}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shirt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Shoe Size: {worker.shoe_size}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Media & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {worker.instagram_handle ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                  <span className="text-sm">@{worker.instagram_handle}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No Instagram handle</div>
              )}

              {worker.tiktok_handle ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-black rounded"></div>
                  <span className="text-sm">@{worker.tiktok_handle}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No TikTok handle</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount Owing:</span>
                <span className={`text-sm font-medium ${worker.amount_owing > 0 ? "text-red-600" : "text-green-600"}`}>
                  R{worker.amount_owing.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance Rating:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(worker.rating)}
                  <span className="text-sm ml-1">{worker.rating}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work History & Notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Work History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{worker.work_history || "No work history available"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Notes & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{worker.notes_comments || "No additional notes"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  )
}
