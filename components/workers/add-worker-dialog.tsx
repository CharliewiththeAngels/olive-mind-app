"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface AddWorkerDialogProps {
  onAddWorker: (worker: any) => void
}

export default function AddWorkerDialog({ onAddWorker }: AddWorkerDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    area: "",
    age: "",
    height: "",
    dress_size: "",
    top_size: "",
    shoe_size: "",
    instagram_handle: "",
    tiktok_handle: "",
    rating: 5,
    amount_owing: 0.0,
    work_contract_signed: false,
    work_history: "",
    notes_comments: "",
    profile_picture_url: "/placeholder.svg?height=40&width=40",
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

      onAddWorker({
        ...formData,
        age: Number.parseInt(formData.age) || 0,
      })

      toast({
        title: "Worker added successfully",
        description: `${formData.full_name} has been added to the database.`,
      })

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        area: "",
        age: "",
        height: "",
        dress_size: "",
        top_size: "",
        shoe_size: "",
        instagram_handle: "",
        tiktok_handle: "",
        rating: 5,
        amount_owing: 0.0,
        work_contract_signed: false,
        work_history: "",
        notes_comments: "",
        profile_picture_url: "/placeholder.svg?height=40&width=40",
      })
    } catch (error: any) {
      toast({
        title: "Error adding worker",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        onClick={() => onRatingChange(i + 1)}
      />
    ))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Worker</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="Enter WhatsApp number"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g., CBD, Bluff"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="e.g., 1,60m"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dress_size">Dress Size</Label>
            <Select
              value={formData.dress_size}
              onValueChange={(value) => setFormData({ ...formData, dress_size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="top_size">Top Size</Label>
            <Select value={formData.top_size} onValueChange={(value) => setFormData({ ...formData, top_size: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shoe_size">Shoe Size</Label>
            <Input
              id="shoe_size"
              value={formData.shoe_size}
              onChange={(e) => setFormData({ ...formData, shoe_size: e.target.value })}
              placeholder="e.g., 5, 6"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram_handle">Instagram Handle</Label>
            <Input
              id="instagram_handle"
              value={formData.instagram_handle}
              onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
              placeholder="username (without @)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok_handle">TikTok Handle</Label>
            <Input
              id="tiktok_handle"
              value={formData.tiktok_handle}
              onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
              placeholder="username (without @)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rating (1-5 stars)</Label>
            <div className="flex items-center space-x-1">
              {renderStars(formData.rating, (rating) => setFormData({ ...formData, rating }))}
              <span className="ml-2 text-sm">{formData.rating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_owing">Amount Owing (R)</Label>
            <Input
              id="amount_owing"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount_owing}
              onChange={(e) => setFormData({ ...formData, amount_owing: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="work_contract_signed"
              checked={formData.work_contract_signed}
              onCheckedChange={(checked) => setFormData({ ...formData, work_contract_signed: checked as boolean })}
            />
            <Label htmlFor="work_contract_signed">Work Contract Signed</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_history">Work History</Label>
          <Textarea
            id="work_history"
            value={formData.work_history}
            onChange={(e) => setFormData({ ...formData, work_history: e.target.value })}
            placeholder="Previous work experience..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes_comments">Notes / Comments</Label>
          <Textarea
            id="notes_comments"
            value={formData.notes_comments}
            onChange={(e) => setFormData({ ...formData, notes_comments: e.target.value })}
            placeholder="Additional notes about the worker..."
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Worker"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
