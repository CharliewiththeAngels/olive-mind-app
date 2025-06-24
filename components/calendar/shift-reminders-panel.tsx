"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Clock, CheckCircle, AlertCircle, Calendar, Send } from "lucide-react"
import { format, isAfter } from "date-fns"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"
import { getRemindersByShift, markReminderAsSent, type ShiftReminder } from "@/lib/reminders-database"
import { scheduleRemindersForShift, calculateReminderTimes, generateReminderMessage } from "@/lib/reminder-scheduler"
import { useToast } from "@/components/ui/use-toast"

interface ShiftRemindersPanelProps {
  shift: Shift
  workers: Worker[]
}

export default function ShiftRemindersPanel({ shift, workers }: ShiftRemindersPanelProps) {
  const { toast } = useToast()
  const [reminders, setReminders] = useState<ShiftReminder[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReminders()
  }, [shift.id])

  const loadReminders = async () => {
    try {
      const remindersData = await getRemindersByShift(shift.id)
      setReminders(remindersData)
    } catch (error) {
      console.error("Failed to load reminders:", error)
    }
  }

  const handleScheduleReminders = async () => {
    setLoading(true)
    try {
      const success = await scheduleRemindersForShift(shift, shift.assigned_workers, workers)
      if (success) {
        toast({
          title: "Reminders scheduled",
          description: "Automatic reminders have been set up for all assigned workers",
        })
        await loadReminders()
      } else {
        throw new Error("Failed to schedule reminders")
      }
    } catch (error) {
      toast({
        title: "Error scheduling reminders",
        description: "Failed to set up automatic reminders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminderNow = async (reminderId: string) => {
    try {
      await markReminderAsSent(reminderId)
      toast({
        title: "Reminder sent",
        description: "Manual reminder has been sent to the worker",
      })
      await loadReminders()
    } catch (error) {
      toast({
        title: "Error sending reminder",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  const getWorkerById = (workerId: string) => {
    return workers.find((w) => w.id === workerId)
  }

  const getStatusIcon = (reminder: ShiftReminder) => {
    const now = new Date()
    const scheduledTime = new Date(reminder.scheduled_for)

    if (reminder.status === "sent") {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (reminder.status === "failed") {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    } else if (isAfter(now, scheduledTime)) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    } else {
      return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (reminder: ShiftReminder) => {
    const now = new Date()
    const scheduledTime = new Date(reminder.scheduled_for)

    if (reminder.status === "sent") {
      return "bg-green-100 text-green-800"
    } else if (reminder.status === "failed") {
      return "bg-red-100 text-red-800"
    } else if (isAfter(now, scheduledTime)) {
      return "bg-orange-100 text-orange-800"
    } else {
      return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusText = (reminder: ShiftReminder) => {
    const now = new Date()
    const scheduledTime = new Date(reminder.scheduled_for)

    if (reminder.status === "sent") {
      return "Sent"
    } else if (reminder.status === "failed") {
      return "Failed"
    } else if (isAfter(now, scheduledTime)) {
      return "Overdue"
    } else {
      return "Scheduled"
    }
  }

  const reminderTimes = calculateReminderTimes(shift.start_datetime)
  const hasAssignedWorkers = shift.assigned_workers.length > 0
  const hasReminders = reminders.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Shift Reminders</span>
          </CardTitle>
          {hasAssignedWorkers && (
            <Button onClick={handleScheduleReminders} disabled={loading} size="sm">
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reminders
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Reminder Schedule Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Automatic Reminder Schedule</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  <strong>Day Before:</strong> {format(reminderTimes.dayBefore, "EEEE d MMMM yyyy 'at' HH:mm")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  <strong>Shift Day:</strong> {format(reminderTimes.shiftDay, "EEEE d MMMM yyyy 'at' HH:mm")}
                </span>
              </div>
              <div className="text-xs mt-2 opacity-75">
                Shift day reminder is sent {new Date(shift.start_datetime).getHours() >= 11 ? "4 hours" : "2 hours"}{" "}
                before shift start
              </div>
            </div>
          </div>

          {/* Reminders Status */}
          {hasReminders ? (
            <div className="space-y-3">
              <h4 className="font-medium">Scheduled Reminders</h4>
              {reminders.map((reminder) => {
                const worker = getWorkerById(reminder.worker_id)
                if (!worker) return null

                return (
                  <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={worker.profile_pictures?.[0] || "/placeholder.svg"} alt={worker.full_name} />
                        <AvatarFallback className="text-xs">
                          {worker.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{worker.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {reminder.reminder_type === "day_before" ? "Day Before Reminder" : "Shift Day Check-in"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm">{format(new Date(reminder.scheduled_for), "MMM d, HH:mm")}</div>
                        {reminder.sent_at && (
                          <div className="text-xs text-muted-foreground">
                            Sent: {format(new Date(reminder.sent_at), "MMM d, HH:mm")}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reminder)}
                        <Badge className={getStatusColor(reminder)}>{getStatusText(reminder)}</Badge>
                      </div>

                      {reminder.status === "scheduled" && (
                        <Button size="sm" variant="outline" onClick={() => handleSendReminderNow(reminder.id)}>
                          <Send className="h-3 w-3 mr-1" />
                          Send Now
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : hasAssignedWorkers ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reminders scheduled yet</p>
              <p className="text-sm">Click "Schedule Reminders" to set up automatic notifications</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workers assigned to this shift</p>
              <p className="text-sm">Assign workers first to schedule reminders</p>
            </div>
          )}

          {/* Reminder Message Preview */}
          {hasAssignedWorkers && (
            <div className="space-y-3">
              <h4 className="font-medium">Message Previews</h4>

              {/* Day Before Message */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Day Before Reminder</span>
                  <Badge variant="outline">18:00 day before</Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <pre className="whitespace-pre-wrap font-mono">
                    {generateReminderMessage(
                      shift,
                      workers.find((w) => w.id === shift.assigned_workers[0]) || workers[0],
                      "day_before",
                    )}
                  </pre>
                </div>
              </div>

              {/* Shift Day Message */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Shift Day Check-in</span>
                  <Badge variant="outline">
                    {new Date(shift.start_datetime).getHours() >= 11 ? "4 hours" : "2 hours"} before
                  </Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <pre className="whitespace-pre-wrap font-mono">
                    {generateReminderMessage(
                      shift,
                      workers.find((w) => w.id === shift.assigned_workers[0]) || workers[0],
                      "shift_day",
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
