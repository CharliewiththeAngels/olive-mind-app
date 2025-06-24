"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Send } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { Shift } from "@/lib/shifts-database"

interface InvitationMessagePreviewProps {
  shift: Shift
  workerName: string
}

export default function InvitationMessagePreview({ shift, workerName }: InvitationMessagePreviewProps) {
  const { toast } = useToast()

  const generateInvitationMessage = () => {
    const startDate = new Date(shift.start_datetime)
    const endDate = new Date(shift.end_datetime)
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100)) / 10

    return `*Work Invitation - Olive Mind Marketing*

Hello ${workerName},

You have been invited to work the following shift:

*Shift Details:*
*Title:* ${shift.title}
*Brand:* ${shift.brand_name}
*Area:* ${shift.area}
*Location:* ${shift.location}
*Date:* ${format(startDate, "EEEE d MMMM yyyy")}
*Time:* ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")} (${duration} hours)
*Rate:* R${shift.hourly_rate} per hour

*Please respond with:*
• *ACCEPT* - to accept this work
• *DECLINE* - to decline this work

⚠️ *Important:* Only the first ${shift.required_workers} workers to accept will be assigned to this shift.

Please respond as soon as possible.

Thank you,
Olive Mind Marketing Team`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateInvitationMessage())
    toast({
      title: "Invitation copied",
      description: "Worker invitation has been copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Invitation Message Preview</CardTitle>
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
          <pre className="whitespace-pre-wrap text-sm font-mono">{generateInvitationMessage()}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
