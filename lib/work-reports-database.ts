"use client"

export interface WorkReport {
  id: string
  shift_id: string
  promoter_id: string
  check_in_time: string | null
  check_in_photo_url: string | null
  check_out_time: string | null
  work_photos: string[] | null
  is_late: boolean

  // Payment calculation (always based on scheduled hours)
  scheduled_hours: number
  payment_amount: number

  // Report type
  report_type: "standard" | "event"

  // Standard Report Fields (new structured format)
  consumer_count?: number
  price_expensive_count?: number
  price_reasonable_count?: number
  price_cheap_count?: number
  quality_good_count?: number
  quality_okay_count?: number
  quality_bad_count?: number
  promo_good_count?: number
  promo_bad_count?: number
  favorite_part?: string
  least_favorite_part?: string
  biggest_competitor?: string
  consumer_suggestions?: string

  // Legacy field (keeping for backward compatibility)
  work_summary: string | null

  // Event Report fields
  event_date?: string
  event_attendance?: number
  event_venue?: string
  lead_brand?: string
  event_description?: string

  // The Consumer/Guest
  consumer_age_group?: string
  consumer_gender?: string
  consumer_income_group?: string
  consumer_social_class?: string

  // Sales Drive
  sales_mechanic?: string

  created_at: string
  updated_at: string
}

// Mock work reports data
const mockWorkReports: WorkReport[] = [
  {
    id: "1",
    shift_id: "1", // Woolworths Promotion
    promoter_id: "1", // Hope
    check_in_time: "2024-12-15T09:15:00",
    check_in_photo_url: "/placeholder.svg?height=400&width=400&text=Check-in+Photo&bg=4ade80&color=white",
    check_out_time: "2024-12-15T17:05:00",
    work_summary:
      "Successfully engaged with over 50 customers today. Product sampling went very well with positive feedback on the new yogurt flavors.",
    work_photos: [
      "/placeholder.svg?height=400&width=400&text=Work+Photo+1&bg=3b82f6&color=white",
      "/placeholder.svg?height=400&width=400&text=Work+Photo+2&bg=8b5cf6&color=white",
    ],
    is_late: true,
    scheduled_hours: 8,
    payment_amount: 1600, // 8 hours × R200/hour
    report_type: "standard",

    // Standard report data (example)
    consumer_count: 50,
    price_expensive_count: 12,
    price_reasonable_count: 35,
    price_cheap_count: 3,
    quality_good_count: 42,
    quality_okay_count: 7,
    quality_bad_count: 1,
    promo_good_count: 48,
    promo_bad_count: 2,
    favorite_part: "Free samples",
    least_favorite_part: "Waiting time",
    biggest_competitor: "Clover",
    consumer_suggestions: "More variety of flavors and smaller packaging options",

    created_at: "2024-12-15T09:15:00",
    updated_at: "2024-12-15T17:05:00",
  },
  {
    id: "2",
    shift_id: "2", // Amstel Radler Promotion
    promoter_id: "2", // Casey
    check_in_time: "2024-12-16T10:10:00",
    check_in_photo_url: "/placeholder.svg?height=400&width=400&text=Check-in+Photo&bg=10b981&color=white",
    check_out_time: "2024-12-16T15:00:00",
    work_summary: "Great day at Liberty Liquors! Introduced Amstel Radler to many customers.",
    work_photos: [
      "/placeholder.svg?height=400&width=400&text=Sales+Photo+1&bg=06b6d4&color=white",
      "/placeholder.svg?height=400&width=400&text=Sales+Photo+2&bg=8b5cf6&color=white",
    ],
    is_late: false,
    scheduled_hours: 5,
    payment_amount: 1000, // 5 hours × R200/hour
    report_type: "standard",

    // Standard report data (example)
    consumer_count: 35,
    price_expensive_count: 8,
    price_reasonable_count: 22,
    price_cheap_count: 5,
    quality_good_count: 30,
    quality_okay_count: 4,
    quality_bad_count: 1,
    promo_good_count: 32,
    promo_bad_count: 3,
    favorite_part: "Taste testing",
    least_favorite_part: "Limited stock",
    biggest_competitor: "Flying Fish",
    consumer_suggestions: "More ice with samples and branded merchandise",

    created_at: "2024-12-16T10:10:00",
    updated_at: "2024-12-16T15:00:00",
  },
  {
    id: "3",
    shift_id: "7", // Bread4Soul Event
    promoter_id: "1", // Hope
    check_in_time: "2025-02-01T18:00:00",
    check_in_photo_url: "/placeholder.svg?height=400&width=400&text=Event+Check-in&bg=dc2626&color=white",
    check_out_time: "2025-02-01T23:00:00",
    work_summary: null,
    work_photos: [
      "/placeholder.svg?height=400&width=400&text=Event+Photo+1&bg=dc2626&color=white",
      "/placeholder.svg?height=400&width=400&text=Event+Photo+2&bg=f59e0b&color=white",
      "/placeholder.svg?height=400&width=400&text=Event+Photo+3&bg=8b5cf6&color=white",
    ],
    is_late: false,
    scheduled_hours: 5,
    payment_amount: 1250, // 5 hours × R250/hour
    report_type: "event",

    // Event Report Data
    event_date: "01 February 2025",
    event_attendance: 1500,
    event_venue: "The Villa Durban",
    lead_brand: "Heineken Lager",
    event_description:
      "The Bread4Soul event is a soulful deep house event, that's attended by the most finest Durban influential people and enjoyed by the deep house lovers with their friends and lovers making it an unforgettable experience.",

    consumer_age_group: "25 - 50 age groups",
    consumer_gender: "All Genders",
    consumer_income_group: "Working Income Groups",
    consumer_social_class: "Business owners",

    sales_mechanic: "Driving sales on Heineken Lager and promoting the Heineken photo moment",

    created_at: "2025-02-01T18:00:00",
    updated_at: "2025-02-01T23:00:00",
  },
]

export const getWorkReports = async (): Promise<WorkReport[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockWorkReports
}

export const createWorkReport = async (
  reportData: Omit<WorkReport, "id" | "created_at" | "updated_at" | "scheduled_hours" | "payment_amount">,
): Promise<WorkReport> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Get shift details to calculate payment
  const { getShifts } = await import("@/lib/shifts-database")
  const shifts = await getShifts()
  const shift = shifts.find((s) => s.id === reportData.shift_id)

  if (!shift) {
    throw new Error("Shift not found")
  }

  // Calculate scheduled hours and payment
  const startTime = new Date(shift.start_datetime)
  const endTime = new Date(shift.end_datetime)
  const scheduledHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  const paymentAmount = scheduledHours * shift.hourly_rate

  const newReport: WorkReport = {
    ...reportData,
    id: Date.now().toString(),
    scheduled_hours: scheduledHours,
    payment_amount: paymentAmount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockWorkReports.push(newReport)
  return newReport
}

export const updateWorkReport = async (id: string, updates: Partial<WorkReport>): Promise<WorkReport> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const reportIndex = mockWorkReports.findIndex((report) => report.id === id)
  if (reportIndex === -1) {
    throw new Error("Work report not found")
  }

  const updatedReport = {
    ...mockWorkReports[reportIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  mockWorkReports[reportIndex] = updatedReport
  return updatedReport
}

export const checkInToShift = async (shiftId: string, promoterId: string, photoUrl: string): Promise<WorkReport> => {
  const checkInTime = new Date().toISOString()

  // Check if worker is late (more than 15 minutes after shift start)
  const { getShifts } = await import("@/lib/shifts-database")
  const shifts = await getShifts()
  const shift = shifts.find((s) => s.id === shiftId)

  let isLate = false
  if (shift) {
    const shiftStart = new Date(shift.start_datetime)
    const checkIn = new Date(checkInTime)
    const diffMinutes = (checkIn.getTime() - shiftStart.getTime()) / (1000 * 60)
    isLate = diffMinutes > 15
  }

  const reportData: Omit<WorkReport, "id" | "created_at" | "updated_at" | "scheduled_hours" | "payment_amount"> = {
    shift_id: shiftId,
    promoter_id: promoterId,
    check_in_time: checkInTime,
    check_in_photo_url: photoUrl,
    check_out_time: null,
    work_summary: null,
    work_photos: null,
    is_late: isLate,
    report_type: "standard", // Default to standard report
  }

  return createWorkReport(reportData)
}

export const checkOutOfShift = async (
  reportId: string,
  workSummary: string,
  workPhotos: string[],
): Promise<WorkReport> => {
  const checkOutTime = new Date().toISOString()

  return updateWorkReport(reportId, {
    check_out_time: checkOutTime,
    work_summary: workSummary,
    work_photos: workPhotos,
  })
}
