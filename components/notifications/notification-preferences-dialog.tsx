"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateNotificationPreferences } from "@/lib/notifications-database"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

interface NotificationPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPreferencesDialog({ open, onOpenChange }: NotificationPreferencesDialogProps) {
  const { user } = useSupabase()
  const { toast } = useToast()

  // Default preferences
  const [preferences, setPreferences] = useState({
    channels: {
      inApp: true,
      email: true,
      sms: false,
    },
    types: {
      shifts: true,
      payments: true,
      reports: true,
      system: true,
    },
    frequency: "immediate", // immediate, daily, weekly
  })

  const handleChannelChange = (channel: keyof typeof preferences.channels) => {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel as keyof typeof prev.channels],
      },
    }))
  }

  const handleTypeChange = (type: keyof typeof preferences.types) => {
    setPreferences((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type as keyof typeof prev.types],
      },
    }))
  }

  const handleFrequencyChange = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      frequency: value,
    }))
  }

  const handleSave = async () => {
    try {
      await updateNotificationPreferences(user?.id || "", preferences)
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>Customize how and when you receive notifications.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="channels" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="frequency">Frequency</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-app">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications within the application</p>
              </div>
              <Switch
                id="in-app"
                checked={preferences.channels.inApp}
                onCheckedChange={() => handleChannelChange("inApp")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email"
                checked={preferences.channels.email}
                onCheckedChange={() => handleChannelChange("email")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS (may incur charges)</p>
              </div>
              <Switch id="sms" checked={preferences.channels.sms} onCheckedChange={() => handleChannelChange("sms")} />
            </div>
          </TabsContent>

          <TabsContent value="types" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shifts">Shift Notifications</Label>
                <p className="text-sm text-muted-foreground">Assignments, reminders, and changes</p>
              </div>
              <Switch
                id="shifts"
                checked={preferences.types.shifts}
                onCheckedChange={() => handleTypeChange("shifts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payments">Payment Notifications</Label>
                <p className="text-sm text-muted-foreground">Payment updates and processing</p>
              </div>
              <Switch
                id="payments"
                checked={preferences.types.payments}
                onCheckedChange={() => handleTypeChange("payments")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reports">Report Notifications</Label>
                <p className="text-sm text-muted-foreground">Report reminders and feedback</p>
              </div>
              <Switch
                id="reports"
                checked={preferences.types.reports}
                onCheckedChange={() => handleTypeChange("reports")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system">System Notifications</Label>
                <p className="text-sm text-muted-foreground">System updates and announcements</p>
              </div>
              <Switch
                id="system"
                checked={preferences.types.system}
                onCheckedChange={() => handleTypeChange("system")}
              />
            </div>
          </TabsContent>

          <TabsContent value="frequency" className="pt-4">
            <RadioGroup value={preferences.frequency} onValueChange={handleFrequencyChange} className="space-y-4">
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <div className="grid gap-1.5">
                  <Label htmlFor="immediate">Immediate</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications as they happen</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <div className="grid gap-1.5">
                  <Label htmlFor="daily">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of all notifications</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <div className="grid gap-1.5">
                  <Label htmlFor="weekly">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of all notifications</p>
                </div>
              </div>
            </RadioGroup>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
