"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Send } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { Shift } from "@/lib/shifts-database"

interface WorkerMessagePreviewProps {
  shift: Shift
}

export default function WorkerMessagePreview({ shift }: WorkerMessagePreviewProps) {
  const { toast } = useToast()

  const generateMessage = () => {
    const startDate = new Date(shift.start_datetime)
    const endDate = new Date(shift.end_datetime)
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100)) / 10

    return `*Good afternoon Miss / Sir  Confirmation of work for Olive Mind*

*Area:* ${shift.area}
*Location:* ${shift.location}
*Date:* ${format(startDate, "EEEE d MMMM yyyy")}
*Time:* ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")} (${duration} hours)
*Rate:* ${shift.hourly_rate} per hour
*Brand:* ${shift.brand_name}

*${shift.call_time_minutes} minutes is for call time and failure to arrive for call time will result to penalties.*

*Dress code:* ${shift.dress_code}

*NB ${shift.special_instructions || "Taking pictures while talking to a customer is important and also pictures of your sales."}*

*• ${shift.photo_requirements}*

*• Please always ensure that your phone is fully charged and also bring a power bank or a charger.*

*How the promotion will work:*

${shift.promotion_details}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMessage())
    toast({
      title: "Message copied",
      description: "Worker message has been copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Worker Message Preview</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm font-mono">{generateMessage()}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
