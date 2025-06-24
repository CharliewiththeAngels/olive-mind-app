"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react"
import { format } from "date-fns"
import type { Worker } from "@/lib/database"

interface CreateShiftDialogProps {
  workers: Worker[]
  selectedDate: Date | null
  onCreateShift: (shift: any) => void
  onCancel: () => void
}

export default function CreateShiftDialog({ workers, selectedDate, onCreateShift, onCancel }: CreateShiftDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand_name: "",
    location: "",
    area: "",
    start_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "17:00",
    required_workers: 1,
    assigned_workers: [] as string[],
    hourly_rate: 150,
    additional_fees: 0,
    call_time_minutes: 45,
    dress_code: "",
    photo_requirements: "A minimum of 15 pictures with different consumers is needed.",
    promotion_details: "",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "draft" as "draft" | "published",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title || !formData.brand_name || !formData.location) {
        throw new Error("Please fill in all required fields")
      }

      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`)
      const endDateTime = new Date(`${formData.start_date}T${formData.end_time}:00`)

      if (endDateTime <= startDateTime) {
        throw new Error("End time must be after start time")
      }

      const shiftData = {
        title: formData.title,
        description: formData.description,
        brand_name: formData.brand_name,
        location: formData.location,
        area: formData.area,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        required_workers: formData.required_workers,
        assigned_workers: formData.assigned_workers,
        hourly_rate: formData.hourly_rate,
        additional_fees: formData.additional_fees,
        call_time_minutes: formData.call_time_minutes,
        dress_code: formData.dress_code,
        photo_requirements: formData.photo_requirements,
        promotion_details: formData.promotion_details,
        special_instructions: formData.special_instructions,
        status: formData.status,
        created_by: "manager-123",
      }

      onCreateShift(shiftData)
    } catch (error: any) {
      toast({
        title: "Error creating shift",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWorkerToggle = (workerId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assigned_workers: [...formData.assigned_workers, workerId],
      })
    } else {
      setFormData({
        ...formData,
        assigned_workers: formData.assigned_workers.filter((id) => id !== workerId),
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Shift</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Shift Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Woolworths Promotion"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="e.g., Woolworths"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Gateway Mall, Durban"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area *</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g., CBD, Bluff, North Coast"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the shift requirements and activities..."
              rows={3}
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workers and Payment */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_workers">Required Workers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="required_workers"
                  type="number"
                  min="1"
                  value={formData.required_workers}
                  onChange={(e) => setFormData({ ...formData, required_workers: Number.parseInt(e.target.value) || 1 })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate (R)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: Number.parseFloat(e.target.value) || 0 })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional_fees">Additional Fees (R)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="additional_fees"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.additional_fees}
                  onChange={(e) =>
                    setFormData({ ...formData, additional_fees: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Worker Message Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="call_time_minutes">Call Time (minutes)</Label>
              <Input
                id="call_time_minutes"
                type="number"
                min="0"
                value={formData.call_time_minutes}
                onChange={(e) => setFormData({ ...formData, call_time_minutes: Number.parseInt(e.target.value) || 45 })}
                placeholder="45"
              />
              <p className="text-xs text-muted-foreground">Time before shift start for preparation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dress_code">Dress Code *</Label>
              <Input
                id="dress_code"
                value={formData.dress_code}
                onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                placeholder="e.g., Brand uniform & white sneakers"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_requirements">Photo Requirements</Label>
            <Textarea
              id="photo_requirements"
              value={formData.photo_requirements}
              onChange={(e) => setFormData({ ...formData, photo_requirements: e.target.value })}
              placeholder="A minimum of 15 pictures with different consumers is needed."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_details">How the promotion will work *</Label>
            <Textarea
              id="promotion_details"
              value={formData.promotion_details}
              onChange={(e) => setFormData({ ...formData, promotion_details: e.target.value })}
              placeholder="Describe how the promotion works, customer requirements, prizes, etc."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any additional instructions for workers..."
              rows={2}
            />
          </div>
        </div>

        {/* Worker Assignment */}
        <div className="space-y-4">
          <Label>Assign Workers (Optional)</Label>
          <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`worker-${worker.id}`}
                  checked={formData.assigned_workers.includes(worker.id)}
                  onCheckedChange={(checked) => handleWorkerToggle(worker.id, checked as boolean)}
                />
                <Label htmlFor={`worker-${worker.id}`} className="text-sm font-normal cursor-pointer">
                  {worker.full_name} - {worker.area}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {formData.assigned_workers.length} / {formData.required_workers} required • {workers.length}{" "}
            workers available
          </p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Shift"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
