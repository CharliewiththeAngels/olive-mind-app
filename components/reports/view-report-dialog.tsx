"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Camera, MapPin, Calendar, User, AlertCircle, CheckCircle, ClipboardList, FileText } from "lucide-react"
import { format } from "date-fns"
import type { WorkReport } from "@/lib/work-reports-database"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { ReportPreviewDialog } from "./report-preview-dialog"

interface ViewReportDialogProps {
  report: WorkReport
  shift: Shift
  worker: Worker
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewReportDialog({ report, shift, worker, open, onOpenChange }: ViewReportDialogProps) {
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false)

  const getStatusBadge = () => {
    if (report.check_in_time && report.check_out_time) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    } else if (report.check_in_time) {
      return <Badge className="bg-blue-100 text-blue-800">Checked In</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  const getScheduledHours = () => {
    const startTime = new Date(shift.start_datetime)
    const endTime = new Date(shift.end_datetime)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours.toFixed(1)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{shift.title} - Work Report</DialogTitle>
                <DialogDescription>
                  {worker.full_name} • {format(new Date(shift.start_datetime), "MMM dd, yyyy")}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {report.is_late && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Late
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Generate Report Button */}
            {report.check_out_time && (
              <div className="flex justify-end">
                <Button onClick={() => setReportPreviewOpen(true)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Client Report
                </Button>
              </div>
            )}

            {/* Shift Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Shift Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Worker:</span>
                    <span>{worker.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{shift.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Scheduled:</span>
                    <span>
                      {format(new Date(shift.start_datetime), "HH:mm")} -{" "}
                      {format(new Date(shift.end_datetime), "HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rate:</span>
                    <span>R{shift.hourly_rate}/hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.check_in_time ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Check-in Time</span>
                      </div>
                      <div className="text-lg font-mono">{format(new Date(report.check_in_time), "HH:mm")}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(report.check_in_time), "MMM dd, yyyy")}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Check-in Time</span>
                      </div>
                      <div className="text-muted-foreground">Not checked in</div>
                    </div>
                  )}

                  {report.check_out_time ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Check-out Time</span>
                      </div>
                      <div className="text-lg font-mono">{format(new Date(report.check_out_time), "HH:mm")}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(report.check_out_time), "MMM dd, yyyy")}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Check-out Time</span>
                      </div>
                      <div className="text-muted-foreground">
                        {report.check_in_time ? "Still working" : "Not started"}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Scheduled Hours</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">{getScheduledHours()} hours</div>
                    <div className="text-sm text-muted-foreground">
                      Payment: R{report.payment_amount || Number.parseFloat(getScheduledHours()) * shift.hourly_rate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-in Photo */}
            {report.check_in_photo_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Check-in Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={report.check_in_photo_url || "/placeholder.svg"}
                    alt="Check-in photo"
                    className="max-w-sm h-48 object-cover rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}

            {/* Standard Report */}
            {report.report_type === "standard" && report.check_out_time && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Standard Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">The venue had approximately </span>
                      <span className="text-blue-600 font-semibold">{report.consumer_count}</span>
                      <span className="font-medium"> consumers during the activation.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-600 font-semibold">{report.price_expensive_count}</span>
                      <span className="font-medium"> consumers thought the product was expensive. </span>
                      <span className="text-blue-600 font-semibold">{report.price_reasonable_count}</span>
                      <span className="font-medium"> consumers thought the product was reasonably priced. </span>
                      <span className="text-blue-600 font-semibold">{report.price_cheap_count}</span>
                      <span className="font-medium"> consumers thought the product was cheap.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-600 font-semibold">{report.quality_good_count}</span>
                      <span className="font-medium"> consumers thought the product was good quality. </span>
                      <span className="text-blue-600 font-semibold">{report.quality_okay_count}</span>
                      <span className="font-medium"> consumers thought the product was just okay quality. </span>
                      <span className="text-blue-600 font-semibold">{report.quality_bad_count}</span>
                      <span className="font-medium"> consumers thought the product was bad quality.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-600 font-semibold">{report.promo_good_count}</span>
                      <span className="font-medium"> consumers thought the promotional drive was good. </span>
                      <span className="text-blue-600 font-semibold">{report.promo_bad_count}</span>
                      <span className="font-medium"> consumers thought the promotional drive was bad.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-600 font-semibold">{report.favorite_part}</span>
                      <span className="font-medium"> was their favourite part of the promotion. </span>
                      <span className="text-blue-600 font-semibold">{report.least_favorite_part}</span>
                      <span className="font-medium"> was their least favourite part of the promotion.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-600 font-semibold">{report.biggest_competitor}</span>
                      <span className="font-medium"> was the biggest competitor on the day.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Consumers suggest </span>
                      <span className="text-blue-600 font-semibold">{report.consumer_suggestions}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {report.report_type === "event" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Overview & Concept</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">{report.event_date}</span>
                      </div>
                      <div>
                        <span className="font-medium">Attendance:</span>
                        <span className="ml-2">{report.event_attendance?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Venue:</span>
                        <span className="ml-2">{report.event_venue}</span>
                      </div>
                      <div>
                        <span className="font-medium">Lead Brand:</span>
                        <span className="ml-2">{report.lead_brand}</span>
                      </div>
                    </div>
                    {report.event_description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-muted-foreground">{report.event_description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">The Consumer/Guest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Age Group:</span>
                        <span className="ml-2">{report.consumer_age_group}</span>
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span>
                        <span className="ml-2">{report.consumer_gender}</span>
                      </div>
                      <div>
                        <span className="font-medium">Income Group:</span>
                        <span className="ml-2">{report.consumer_income_group}</span>
                      </div>
                      <div>
                        <span className="font-medium">Social Class:</span>
                        <span className="ml-2">{report.consumer_social_class}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Drive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <span className="font-medium">The Mechanic:</span>
                      <p className="mt-1 text-muted-foreground">{report.sales_mechanic}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Work Photos */}
            {report.work_photos && report.work_photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Work Photos ({report.work_photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {report.work_photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`Work photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <ReportPreviewDialog
        report={report}
        shift={shift}
        worker={worker}
        open={reportPreviewOpen}
        onOpenChange={setReportPreviewOpen}
      />
    </>
  )
}
