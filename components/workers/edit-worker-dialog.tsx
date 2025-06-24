"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditWorkerDialogProps {
  worker: any
  onEditWorker: (worker: any) => void
  onCancel: () => void
}

export default function EditWorkerDialog({ worker, onEditWorker, onCancel }: EditWorkerDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: worker.id,
    full_name: worker.full_name,
    email: worker.email,
    phone: worker.phone,
    hourly_rate: worker.hourly_rate,
    status: worker.status,
    profile_picture_url: worker.profile_picture_url,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.full_name || !formData.email || !formData.phone) {
        throw new Error("Please fill in all required fields")
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      onEditWorker(formData)

      toast({
        title: "Worker updated successfully",
        description: `${formData.full_name}'s information has been updated.`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating worker",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Worker</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
          <Input
            id="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: Number.parseFloat(e.target.value) || 0 })}
            placeholder="100.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Worker"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
