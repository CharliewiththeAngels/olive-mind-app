"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Mail } from "lucide-react"
import { format } from "date-fns"
import type { WorkReport } from "@/lib/work-reports-database"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"

interface ReportPreviewDialogProps {
  report: WorkReport
  shift: Shift
  worker: Worker
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportPreviewDialog({ report, shift, worker, open, onOpenChange }: ReportPreviewDialogProps) {
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    // In a real app, this would generate and download a PDF
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setDownloading(false)
    alert("Report downloaded successfully!")
  }

  const handleEmail = async () => {
    setEmailing(true)
    // In a real app, this would email the report
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setEmailing(false)
    alert("Report emailed successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
          <DialogDescription>Preview the report before downloading or sending to clients</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleEmail} disabled={emailing}>
              <Mail className="h-4 w-4 mr-2" />
              {emailing ? "Sending..." : "Email Report"}
            </Button>
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>

          <Card className="border-2">
            <CardContent className="p-6">
              {report.report_type === "standard" ? (
                <StandardReportTemplate report={report} shift={shift} worker={worker} />
              ) : (
                <EventReportTemplate report={report} shift={shift} worker={worker} />
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StandardReportTemplate({ report, shift, worker }: { report: WorkReport; shift: Shift; worker: Worker }) {
  return (
    <div className="space-y-6 font-serif">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{shift.location} Report</h1>
        <p className="text-gray-600">Date: {format(new Date(shift.start_datetime), "dd MMMM yyyy")}</p>
        <p className="text-gray-600">Promoter: {worker.full_name}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">CONSUMER FEEDBACK SUMMARY</h2>
        <ul className="space-y-4 list-none">
          <li>
            • The venue had approximately <span className="font-bold">{report.consumer_count}</span> consumers during
            the activation.
          </li>

          <li>
            • <span className="font-bold">{report.price_expensive_count}</span> consumers thought the product was
            expensive. <span className="font-bold">{report.price_reasonable_count}</span> consumers thought the product
            was reasonably priced. <span className="font-bold">{report.price_cheap_count}</span> consumers thought the
            product was cheap.
          </li>

          <li>
            • <span className="font-bold">{report.quality_good_count}</span> consumers thought the product was good
            quality. <span className="font-bold">{report.quality_okay_count}</span> consumers thought the product was
            just okay quality. <span className="font-bold">{report.quality_bad_count}</span> consumers thought the
            product was bad quality.
          </li>

          <li>
            • <span className="font-bold">{report.promo_good_count}</span> consumers thought the promotional drive was
            good. <span className="font-bold">{report.promo_bad_count}</span> consumers thought the promotional drive
            was bad.
          </li>

          <li>
            • <span className="font-bold">{report.favorite_part}</span> was their favourite part of the promotion.{" "}
            <span className="font-bold">{report.least_favorite_part}</span> was their least favourite part of the
            promotion.
          </li>

          <li>
            • <span className="font-bold">{report.biggest_competitor}</span> was the biggest competitor on the day.
          </li>

          <li>
            • Consumers suggest <span className="font-bold">{report.consumer_suggestions}</span>
          </li>
        </ul>
      </div>

      {report.work_photos && report.work_photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">WORK PHOTOS</h2>
          <div className="grid grid-cols-2 gap-4">
            {report.work_photos.map((photo, index) => (
              <div key={index} className="aspect-video">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Work photo ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventReportTemplate({ report, shift, worker }: { report: WorkReport; shift: Shift; worker: Worker }) {
  return (
    <div className="space-y-6 font-serif">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Event: {report.lead_brand}</h1>
        <p>Date: {report.event_date}</p>
        <p>Attendance: {report.event_attendance?.toLocaleString()}</p>
        <p>Venue: {report.event_venue}</p>
        <p>Lead Brand: {report.lead_brand}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">EVENT OVERVIEW & CONCEPT</h2>
        <p className="mb-4">{report.event_description}</p>
        <ul className="list-none space-y-1">
          <li>• Social Media reach through influential participants.</li>
          <li>• Brand Hash tag on social media post, maximizes exposure for the brand.</li>
          <li>• Advertising of branding.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">THE CONSUMER/GUEST</h2>
          <ul className="list-none space-y-1">
            <li>• {report.consumer_age_group}</li>
            <li>• {report.consumer_gender}</li>
            <li>• {report.consumer_income_group}</li>
            <li>• {report.consumer_social_class}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">SOCIAL MEDIA BENEFIT</h2>
          <ul className="list-none space-y-1">
            <li>• Delivery & Collection</li>
            <li>• Promoters</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">SALES DRIVE</h2>
          <ul className="list-none space-y-1">
            <li>• {report.sales_mechanic}</li>
          </ul>
        </div>
      </div>

      {report.work_photos && report.work_photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">EVENT PHOTOS</h2>
          <div className="grid grid-cols-2 gap-4">
            {report.work_photos.map((photo, index) => (
              <div key={index} className="aspect-video">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Event photo ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
