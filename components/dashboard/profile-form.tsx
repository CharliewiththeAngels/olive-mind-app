"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"

interface ProfileFormProps {
  initialData: any
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(initialData?.full_name || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialData?.profile_picture_url || "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let updatedProfilePictureUrl = profilePictureUrl

      // Upload profile picture if a new one was selected
      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `profile-pictures/${fileName}`

        const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(filePath, profilePicture)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

        updatedProfilePictureUrl = data.publicUrl
      }

      // Update profile information
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          profile_picture_url: updatedProfilePictureUrl,
        })
        .eq("id", initialData.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const userInitials = fullName ? fullName.substring(0, 2).toUpperCase() : "OM"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profilePictureUrl || "/placeholder.svg"} alt={fullName} />
          <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
        </Avatar>

        <div className="flex items-center space-x-2">
          <Label htmlFor="picture" className="cursor-pointer text-sm font-medium text-primary hover:underline">
            <Upload className="mr-2 inline-block h-4 w-4" />
            Upload Picture
          </Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {profilePicture && <span className="text-sm text-muted-foreground">{profilePicture.name}</span>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={initialData?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={initialData?.role === "manager" ? "Manager" : "Promoter"} disabled />
          <p className="text-xs text-muted-foreground">Role cannot be changed</p>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  )
}
