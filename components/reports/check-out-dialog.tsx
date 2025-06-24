"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, MapPin, Clock, X, FileText } from "lucide-react"
import { checkOutOfShift, getWorkReports } from "@/lib/work-reports-database"
import { useSupabase } from "@/lib/supabase-provider"
import { getAllWorkers } from "@/lib/database"
import { format } from "date-fns"
import type { Shift } from "@/lib/shifts-database"
import { Input } from "@/components/ui/input"
import { ReportPreviewDialog } from "./report-preview-dialog"

interface CheckOutDialogProps {
  shift: Shift
  onSuccess: () => void
  children: React.ReactNode
}

export function CheckOutDialog({ shift, onSuccess, children }: CheckOutDialogProps) {
  const { user } = useSupabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [workPhotos, setWorkPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewReport, setPreviewReport] = useState<any>(null)

  // Add state for report type and fields
  const [reportType, setReportType] = useState<"standard" | "event">("standard")

  // Standard report fields
  const [standardReport, setStandardReport] = useState({
    consumer_count: "",
    price_expensive_count: "",
    price_reasonable_count: "",
    price_cheap_count: "",
    quality_good_count: "",
    quality_okay_count: "",
    quality_bad_count: "",
    promo_good_count: "",
    promo_bad_count: "",
    favorite_part: "",
    least_favorite_part: "",
    biggest_competitor: "",
    consumer_suggestions: "",
  })

  // Event report fields
  const [eventData, setEventData] = useState({
    event_date: "",
    event_attendance: "",
    event_venue: "",
    lead_brand: "",
    event_description: "",
    consumer_age_group: "",
    consumer_gender: "",
    consumer_income_group: "",
    consumer_social_class: "",
    sales_mechanic: "",
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPhotos = [...workPhotos, ...files].slice(0, 10) // Max 10 photos
    setWorkPhotos(newPhotos)

    // Generate previews
    const newPreviews = [...photoPreviews]
    files.forEach((file, index) => {
      if (newPreviews.length < 10) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string].slice(0, 10))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removePhoto = (index: number) => {
    setWorkPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStandardReportChange = (field: string, value: string) => {
    setStandardReport((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isStandardReportValid = () => {
    // Check if all required fields are filled
    const requiredFields = [
      "consumer_count",
      "price_expensive_count",
      "price_reasonable_count",
      "price_cheap_count",
      "quality_good_count",
      "quality_okay_count",
      "quality_bad_count",
      "promo_good_count",
      "promo_bad_count",
      "favorite_part",
      "least_favorite_part",
      "biggest_competitor",
      "consumer_suggestions",
    ]

    return requiredFields.every((field) => standardReport[field as keyof typeof standardReport].trim() !== "")
  }

  const handlePreviewReport = async () => {
    if (!user) return

    try {
      // Get current worker
      const workers = await getAllWorkers()
      const currentWorker = workers.find((w) => w.email === user.email)

      if (!currentWorker) {
        throw new Error("Worker not found")
      }

      // In a real app, you would upload the photos to storage first
      // For demo, we'll use placeholder URLs
      const photoUrls = photoPreviews.map(
        (_, index) => `/placeholder.svg?height=400&width=400&text=Work+Photo+${index + 1}&bg=3b82f6&color=white`,
      )

      // Generate a summary for backward compatibility
      let workSummary = ""
      if (reportType === "standard") {
        workSummary = `Consumer count: ${standardReport.consumer_count}. Price feedback: ${standardReport.price_expensive_count} expensive, ${standardReport.price_reasonable_count} reasonable, ${standardReport.price_cheap_count} cheap. Quality feedback: ${standardReport.quality_good_count} good, ${standardReport.quality_okay_count} okay, ${standardReport.quality_bad_count} bad. Promotion feedback: ${standardReport.promo_good_count} good, ${standardReport.promo_bad_count} bad. Favorite part: ${standardReport.favorite_part}. Least favorite: ${standardReport.least_favorite_part}. Biggest competitor: ${standardReport.biggest_competitor}. Suggestions: ${standardReport.consumer_suggestions}`
      }

      // Create a mock report for preview
      const mockReport = {
        id: "preview",
        shift_id: shift.id,
        promoter_id: currentWorker.id,
        check_in_time: new Date().toISOString(),
        check_in_photo_url: null,
        check_out_time: new Date().toISOString(),
        work_photos: photoUrls,
        is_late: false,
        scheduled_hours: 4,
        payment_amount: 4 * shift.hourly_rate,
        report_type: reportType,
        work_summary: workSummary,
        ...(reportType === "standard"
          ? {
              consumer_count: Number(standardReport.consumer_count) || 0,
              price_expensive_count: Number(standardReport.price_expensive_count) || 0,
              price_reasonable_count: Number(standardReport.price_reasonable_count) || 0,
              price_cheap_count: Number(standardReport.price_cheap_count) || 0,
              quality_good_count: Number(standardReport.quality_good_count) || 0,
              quality_okay_count: Number(standardReport.quality_okay_count) || 0,
              quality_bad_count: Number(standardReport.quality_bad_count) || 0,
              promo_good_count: Number(standardReport.promo_good_count) || 0,
              promo_bad_count: Number(standardReport.promo_bad_count) || 0,
              favorite_part: standardReport.favorite_part,
              least_favorite_part: standardReport.least_favorite_part,
              biggest_competitor: standardReport.biggest_competitor,
              consumer_suggestions: standardReport.consumer_suggestions,
            }
          : {
              event_date: eventData.event_date,
              event_attendance: Number.parseInt(eventData.event_attendance) || 0,
              event_venue: eventData.event_venue,
              lead_brand: eventData.lead_brand,
              event_description: eventData.event_description,
              consumer_age_group: eventData.consumer_age_group,
              consumer_gender: eventData.consumer_gender,
              consumer_income_group: eventData.consumer_income_group,
              consumer_social_class: eventData.consumer_social_class,
              sales_mechanic: eventData.sales_mechanic,
            }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setPreviewReport(mockReport)
      setShowPreview(true)
    } catch (error) {
      console.error("Error generating preview:", error)
    }
  }

  const handleCheckOut = async () => {
    if (!user) return

    // Validate based on report type
    if (reportType === "standard" && !isStandardReportValid()) {
      alert("Please fill in all the required fields in the standard report.")
      return
    }

    setLoading(true)
    try {
      // Get current worker and their work report
      const workers = await getAllWorkers()
      const currentWorker = workers.find((w) => w.email === user.email)

      if (!currentWorker) {
        throw new Error("Worker not found")
      }

      // Find the work report for this shift
      const reports = await getWorkReports()
      const workReport = reports.find(
        (r) => r.shift_id === shift.id && r.promoter_id === currentWorker.id && r.check_in_time && !r.check_out_time,
      )

      if (!workReport) {
        throw new Error("Work report not found")
      }

      // In a real app, you would upload the photos to storage first
      // For demo, we'll use placeholder URLs
      const photoUrls = workPhotos.map(
        (_, index) => `/placeholder.svg?height=400&width=400&text=Work+Photo+${index + 1}&bg=3b82f6&color=white`,
      )

      // Generate a summary for backward compatibility
      let workSummary = ""
      if (reportType === "standard") {
        workSummary = `Consumer count: ${standardReport.consumer_count}. Price feedback: ${standardReport.price_expensive_count} expensive, ${standardReport.price_reasonable_count} reasonable, ${standardReport.price_cheap_count} cheap. Quality feedback: ${standardReport.quality_good_count} good, ${standardReport.quality_okay_count} okay, ${standardReport.quality_bad_count} bad. Promotion feedback: ${standardReport.promo_good_count} good, ${standardReport.promo_bad_count} bad. Favorite part: ${standardReport.favorite_part}. Least favorite: ${standardReport.least_favorite_part}. Biggest competitor: ${standardReport.biggest_competitor}. Suggestions: ${standardReport.consumer_suggestions}`
      }

      const updateData: any = {
        check_out_time: new Date().toISOString(),
        work_photos: photoUrls,
        report_type: reportType,
        work_summary: workSummary,
      }

      // Add the appropriate report data based on type
      if (reportType === "standard") {
        Object.assign(updateData, {
          consumer_count: Number(standardReport.consumer_count) || 0,
          price_expensive_count: Number(standardReport.price_expensive_count) || 0,
          price_reasonable_count: Number(standardReport.price_reasonable_count) || 0,
          price_cheap_count: Number(standardReport.price_cheap_count) || 0,
          quality_good_count: Number(standardReport.quality_good_count) || 0,
          quality_okay_count: Number(standardReport.quality_okay_count) || 0,
          quality_bad_count: Number(standardReport.quality_bad_count) || 0,
          promo_good_count: Number(standardReport.promo_good_count) || 0,
          promo_bad_count: Number(standardReport.promo_bad_count) || 0,
          favorite_part: standardReport.favorite_part,
          least_favorite_part: standardReport.least_favorite_part,
          biggest_competitor: standardReport.biggest_competitor,
          consumer_suggestions: standardReport.consumer_suggestions,
        })
      } else if (reportType === "event") {
        Object.assign(updateData, {
          event_date: eventData.event_date,
          event_attendance: Number.parseInt(eventData.event_attendance) || 0,
          event_venue: eventData.event_venue,
          lead_brand: eventData.lead_brand,
          event_description: eventData.event_description,
          consumer_age_group: eventData.consumer_age_group,
          consumer_gender: eventData.consumer_gender,
          consumer_income_group: eventData.consumer_income_group,
          consumer_social_class: eventData.consumer_social_class,
          sales_mechanic: eventData.sales_mechanic,
        })
      }

      await checkOutOfShift(workReport.id, workSummary, photoUrls)

      onSuccess()
      setOpen(false)
      setWorkPhotos([])
      setPhotoPreviews([])
    } catch (error) {
      console.error("Error checking out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check Out of Shift</DialogTitle>
            <DialogDescription>Complete your work report with a summary and photos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Shift Details */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold">{shift.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {shift.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(shift.start_datetime), "MMM dd, yyyy 'at' HH:mm")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add report type selection after shift details card: */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="standard"
                      checked={reportType === "standard"}
                      onChange={(e) => setReportType(e.target.value as "standard" | "event")}
                    />
                    <span>Standard Work Report</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="event"
                      checked={reportType === "event"}
                      onChange={(e) => setReportType(e.target.value as "standard" | "event")}
                    />
                    <span>Event Report</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Standard Report Fields */}
            {reportType === "standard" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Standard Report</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Please fill in the blank spaces with either numbers or words that represent what happened during
                    your shift.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p>
                      The venue had approximately{" "}
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.consumer_count}
                        onChange={(e) => handleStandardReportChange("consumer_count", e.target.value)}
                      />{" "}
                      consumers during the activation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.price_expensive_count}
                        onChange={(e) => handleStandardReportChange("price_expensive_count", e.target.value)}
                      />{" "}
                      consumers thought the product was expensive.
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.price_reasonable_count}
                        onChange={(e) => handleStandardReportChange("price_reasonable_count", e.target.value)}
                      />{" "}
                      consumers thought the product was reasonably priced.
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.price_cheap_count}
                        onChange={(e) => handleStandardReportChange("price_cheap_count", e.target.value)}
                      />{" "}
                      consumers thought the product was cheap.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.quality_good_count}
                        onChange={(e) => handleStandardReportChange("quality_good_count", e.target.value)}
                      />{" "}
                      consumers thought the product was good quality.
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.quality_okay_count}
                        onChange={(e) => handleStandardReportChange("quality_okay_count", e.target.value)}
                      />{" "}
                      consumers thought the product was just okay quality.
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.quality_bad_count}
                        onChange={(e) => handleStandardReportChange("quality_bad_count", e.target.value)}
                      />{" "}
                      consumers thought the product was bad quality.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.promo_good_count}
                        onChange={(e) => handleStandardReportChange("promo_good_count", e.target.value)}
                      />{" "}
                      consumers thought the promotional drive was good.
                      <Input
                        className="w-20 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.promo_bad_count}
                        onChange={(e) => handleStandardReportChange("promo_bad_count", e.target.value)}
                      />{" "}
                      consumers thought the promotional drive was bad.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <Input
                        className="w-40 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.favorite_part}
                        onChange={(e) => handleStandardReportChange("favorite_part", e.target.value)}
                      />{" "}
                      was their favourite part of the promotion.
                      <Input
                        className="w-40 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.least_favorite_part}
                        onChange={(e) => handleStandardReportChange("least_favorite_part", e.target.value)}
                      />{" "}
                      was their least favourite part of the promotion.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <Input
                        className="w-40 inline-block mx-1 px-2 py-1 h-8"
                        value={standardReport.biggest_competitor}
                        onChange={(e) => handleStandardReportChange("biggest_competitor", e.target.value)}
                      />{" "}
                      was the biggest competitor on the day.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      Consumers suggest
                      <Input
                        className="w-full inline-block my-1 px-2 py-1 h-8"
                        value={standardReport.consumer_suggestions}
                        onChange={(e) => handleStandardReportChange("consumer_suggestions", e.target.value)}
                      />
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add event report fields when event type is selected: */}
            {reportType === "event" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Overview & Concept</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event-date">Date</Label>
                        <Input
                          id="event-date"
                          value={eventData.event_date}
                          onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                          placeholder="01 February 2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-attendance">Attendance</Label>
                        <Input
                          id="event-attendance"
                          type="number"
                          value={eventData.event_attendance}
                          onChange={(e) => setEventData({ ...eventData, event_attendance: e.target.value })}
                          placeholder="1500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-venue">Venue</Label>
                        <Input
                          id="event-venue"
                          value={eventData.event_venue}
                          onChange={(e) => setEventData({ ...eventData, event_venue: e.target.value })}
                          placeholder="The Villa Durban"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lead-brand">Lead Brand</Label>
                        <Input
                          id="lead-brand"
                          value={eventData.lead_brand}
                          onChange={(e) => setEventData({ ...eventData, lead_brand: e.target.value })}
                          placeholder="Heineken Lager"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={eventData.event_description}
                        onChange={(e) => setEventData({ ...eventData, event_description: e.target.value })}
                        placeholder="Describe the event concept and overview..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">The Consumer/Guest</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="consumer-age">Age of Consumers</Label>
                        <Input
                          id="consumer-age"
                          value={eventData.consumer_age_group}
                          onChange={(e) => setEventData({ ...eventData, consumer_age_group: e.target.value })}
                          placeholder="25 - 50 age groups"
                        />
                      </div>
                      <div>
                        <Label htmlFor="consumer-gender">Gender</Label>
                        <Input
                          id="consumer-gender"
                          value={eventData.consumer_gender}
                          onChange={(e) => setEventData({ ...eventData, consumer_gender: e.target.value })}
                          placeholder="All Genders"
                        />
                      </div>
                      <div>
                        <Label htmlFor="consumer-income">Income Group</Label>
                        <Input
                          id="consumer-income"
                          value={eventData.consumer_income_group}
                          onChange={(e) => setEventData({ ...eventData, consumer_income_group: e.target.value })}
                          placeholder="Working Income Groups"
                        />
                      </div>
                      <div>
                        <Label htmlFor="consumer-social">Social Class</Label>
                        <Input
                          id="consumer-social"
                          value={eventData.consumer_social_class}
                          onChange={(e) => setEventData({ ...eventData, consumer_social_class: e.target.value })}
                          placeholder="Business owners"
                        />
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
                      <Label htmlFor="sales-mechanic">The Mechanic</Label>
                      <Textarea
                        id="sales-mechanic"
                        value={eventData.sales_mechanic}
                        onChange={(e) => setEventData({ ...eventData, sales_mechanic: e.target.value })}
                        placeholder="Driving sales on Heineken Lager and promoting the Heineken photo moment"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Work Photos */}
            <div className="space-y-2">
              <Label>Work Photos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center space-y-2">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <Label htmlFor="work-photos" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload photos</span>
                      <span className="text-gray-500"> of your work</span>
                    </Label>
                    <input
                      id="work-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Upload up to 10 photos (PNG, JPG up to 5MB each)</p>
                </div>
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Work photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handlePreviewReport}
                disabled={(reportType === "standard" && !isStandardReportValid()) || loading}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Preview Report
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={(reportType === "standard" && !isStandardReportValid()) || loading}
                className="flex-1"
              >
                {loading ? "Checking Out..." : "Complete Shift"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      {previewReport && (
        <ReportPreviewDialog
          report={previewReport}
          shift={shift}
          worker={{
            id: previewReport.promoter_id,
            full_name: user?.email?.split("@")[0] || "Worker",
            email: user?.email || "",
          }}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </>
  )
}
