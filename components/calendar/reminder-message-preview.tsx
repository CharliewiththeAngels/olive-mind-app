"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Send, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"
import { generateReminderMessage, calculateReminderTimes } from "@/lib/reminder-scheduler"

interface ReminderMessagePreviewProps {
  shift: Shift
  worker: Worker
  reminderType: "day_before" | "shift_day"
}

export default function ReminderMessagePreview({ shift, worker, reminderType }: ReminderMessagePreviewProps) {
  const { toast } = useToast()

  const message = generateReminderMessage(shift, worker, reminderType)
  const reminderTimes = calculateReminderTimes(shift.start_datetime)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message)
    toast({
      title: "Message copied",
      description: "Reminder message has been copied to clipboard",
    })
  }

  const getScheduleInfo = () => {
    if (reminderType === "day_before") {
      return {
        title: "Day Before Reminder",
        time: format(reminderTimes.dayBefore, "EEEE d MMMM yyyy 'at' HH:mm"),
        icon: <Calendar className="h-4 w-4" />,
        description: "Sent at 18:00 the day before the shift",
      }
    } else {
      const hours = new Date(shift.start_datetime).getHours() >= 11 ? 4 : 2
      return {
        title: "Shift Day Check-in",
        time: format(reminderTimes.shiftDay, "EEEE d MMMM yyyy 'at' HH:mm"),
        icon: <Clock className="h-4 w-4" />,
        description: `Sent ${hours} hours before shift start`,
      }
    }
  }

  const scheduleInfo = getScheduleInfo()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {scheduleInfo.icon}
            <CardTitle className="text-lg">{scheduleInfo.title}</CardTitle>
            <Badge variant="outline">{worker.full_name}</Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Scheduled for: {scheduleInfo.time}
          <br />
          {scheduleInfo.description}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm font-mono">{message}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
