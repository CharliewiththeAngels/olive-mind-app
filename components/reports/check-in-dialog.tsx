"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, MapPin, Clock, AlertCircle } from "lucide-react"
import { checkInToShift } from "@/lib/work-reports-database"
import { useSupabase } from "@/lib/supabase-provider"
import { getAllWorkers } from "@/lib/database"
import { format } from "date-fns"
import type { Shift } from "@/lib/shifts-database"

interface CheckInDialogProps {
  shift: Shift
  onSuccess: () => void
  children: React.ReactNode
}

export function CheckInDialog({ shift, onSuccess, children }: CheckInDialogProps) {
  const { user } = useSupabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCheckIn = async () => {
    if (!photoFile || !user) return

    setLoading(true)
    try {
      // Get current worker
      const workers = await getAllWorkers()
      const currentWorker = workers.find((w) => w.email === user.email)

      if (!currentWorker) {
        throw new Error("Worker not found")
      }

      // In a real app, you would upload the photo to storage first
      // For demo, we'll use a placeholder URL
      const photoUrl = `/placeholder.svg?height=400&width=400&text=Check-in+Photo&bg=4ade80&color=white`

      await checkInToShift(shift.id, currentWorker.id, photoUrl)

      onSuccess()
      setOpen(false)
      setPhotoFile(null)
      setPhotoPreview(null)
    } catch (error) {
      console.error("Error checking in:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if worker might be late
  const shiftStart = new Date(shift.start_datetime)
  const now = new Date()
  const diffMinutes = (now.getTime() - shiftStart.getTime()) / (1000 * 60)
  const isLate = diffMinutes > 15

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check In to Shift</DialogTitle>
          <DialogDescription>Take a photo to confirm your arrival at the work location</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shift Details */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">{shift.title}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {shift.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(shift.start_datetime), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              </div>
              {isLate && (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  You are checking in late ({Math.round(diffMinutes)} minutes)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="check-in-photo">Check-in Photo *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {photoPreview ? (
                <div className="space-y-2">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Check-in preview"
                    className="max-w-full h-32 object-cover mx-auto rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                    }}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <Label htmlFor="check-in-photo" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload a photo</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <input
                      id="check-in-photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={!photoFile || loading} className="flex-1">
              {loading ? "Checking In..." : "Check In"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
