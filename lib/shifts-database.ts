"use client"

import { scheduleRemindersForShift } from "@/lib/reminder-scheduler"

export interface Shift {
  id: string
  title: string
  description: string
  brand_name: string
  location: string
  start_datetime: string
  end_datetime: string
  required_workers: number
  assigned_workers: string[] // Array of worker IDs who accepted
  invited_workers: string[] // Array of worker IDs who were invited
  hourly_rate: number
  additional_fees: number
  status: "draft" | "published" | "cancelled" | "full"
  created_by: string
  created_at: string
  updated_at: string
  // New fields for worker messages
  area: string
  call_time_minutes: number // Default 45 minutes
  dress_code: string
  photo_requirements: string
  promotion_details: string
  special_instructions?: string
}

// Mock shifts data with some workers assigned for demo
const mockShifts: Shift[] = [
  {
    id: "1",
    title: "Woolworths Promotion",
    description: "Product sampling and customer engagement",
    brand_name: "Woolworths",
    location: "Gateway Mall, Durban",
    area: "CBD",
    start_datetime: "2024-12-15T09:00:00",
    end_datetime: "2024-12-15T17:00:00",
    required_workers: 3,
    assigned_workers: ["1", "3"], // Hope and Elihle assigned
    invited_workers: ["1", "3", "5"],
    hourly_rate: 150,
    additional_fees: 50,
    call_time_minutes: 45,
    dress_code: "Woolworths uniform & black shoes",
    photo_requirements: "A minimum of 15 pictures with different consumers is needed.",
    promotion_details: "Product sampling and customer engagement for new product line.",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-01T10:00:00",
    updated_at: "2024-12-01T10:00:00",
  },
  {
    id: "2",
    title: "Amstel Radler Promotion",
    description: "Re-introducing the Amstel Radler to consumers",
    brand_name: "Amstel Radler",
    location: "Liberty Liquors Queens",
    area: "CBD",
    start_datetime: "2024-12-16T10:15:00",
    end_datetime: "2024-12-16T15:00:00",
    required_workers: 2,
    assigned_workers: ["2"], // Casey assigned
    invited_workers: ["2", "4"],
    hourly_rate: 100,
    additional_fees: 0,
    call_time_minutes: 45,
    dress_code: "Amstel Radler uniform & white sneakers",
    photo_requirements: "A minimum of 15 pictures with different consumers is needed.",
    promotion_details:
      "Re-introducing the Amstel Radler to the consumers by driving tasters and providing product information. Customers need to buy 2-3 cases of Amstel Radler to receive a promo kit and they must submit they till slips with they name surname and number and they stand a chance to win R5000 worth of prizes. Please ensure that you put the till slips inside the entry box please. Please ensure that you notify the Reps to leave with the entry box.",
    special_instructions: "Taking pictures while talking to a customer is important and also pictures of your sales.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-02T14:00:00",
    updated_at: "2024-12-02T14:00:00",
  },
  {
    id: "3",
    title: "Coca-Cola Activation",
    description: "Brand activation and customer interaction",
    brand_name: "Coca-Cola",
    location: "Durban CBD",
    area: "CBD",
    start_datetime: "2024-12-18T08:00:00",
    end_datetime: "2024-12-18T18:00:00",
    required_workers: 5,
    assigned_workers: ["1", "2", "3"], // Hope, Casey, and Elihle assigned
    invited_workers: ["1", "2", "3", "4", "5", "6"],
    hourly_rate: 180,
    additional_fees: 100,
    call_time_minutes: 45,
    dress_code: "Coca-Cola uniform & comfortable shoes",
    photo_requirements: "A minimum of 20 pictures with different consumers is needed.",
    promotion_details: "Brand activation and customer interaction for new Coca-Cola campaign.",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-03T09:00:00",
    updated_at: "2024-12-03T09:00:00",
  },
  {
    id: "4",
    title: "Samsung Demo",
    description: "Product demonstration and sales support",
    brand_name: "Samsung",
    location: "La Lucia Mall",
    area: "North Coast",
    start_datetime: "2024-12-20T09:00:00",
    end_datetime: "2024-12-20T17:00:00",
    required_workers: 4,
    assigned_workers: [], // No workers assigned yet
    invited_workers: [],
    hourly_rate: 160,
    additional_fees: 75,
    call_time_minutes: 30,
    dress_code: "Samsung uniform & black shoes",
    photo_requirements: "A minimum of 10 pictures with different consumers is needed.",
    promotion_details: "Product demonstration and sales support for new Samsung devices.",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-04T11:00:00",
    updated_at: "2024-12-04T11:00:00",
  },
  {
    id: "5",
    title: "MTN Promotion",
    description: "SIM card sales and customer service",
    brand_name: "MTN",
    location: "Musgrave Centre",
    area: "Berea",
    start_datetime: "2024-12-22T10:00:00",
    end_datetime: "2024-12-22T18:00:00",
    required_workers: 3,
    assigned_workers: ["3"], // Elihle assigned
    invited_workers: ["3", "7", "8"],
    hourly_rate: 140,
    additional_fees: 25,
    call_time_minutes: 45,
    dress_code: "MTN uniform & comfortable shoes",
    photo_requirements: "A minimum of 15 pictures with different consumers is needed.",
    promotion_details: "SIM card sales and customer service for MTN promotion.",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-05T15:00:00",
    updated_at: "2024-12-05T15:00:00",
  },
  {
    id: "6",
    title: "Pick n Pay Sampling",
    description: "Product sampling and customer engagement",
    brand_name: "Pick n Pay",
    location: "Pavilion Shopping Centre",
    area: "Westville",
    start_datetime: "2024-12-14T10:00:00",
    end_datetime: "2024-12-14T16:00:00",
    required_workers: 2,
    assigned_workers: ["1"], // Hope assigned
    invited_workers: ["1", "2"],
    hourly_rate: 120,
    additional_fees: 30,
    call_time_minutes: 45,
    dress_code: "Pick n Pay uniform & comfortable shoes",
    photo_requirements: "A minimum of 12 pictures with different consumers is needed.",
    promotion_details: "Product sampling for new food products and customer feedback collection.",
    special_instructions: "Please ensure that your phone is fully charged and also bring a power bank or a charger.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-06T16:00:00",
    updated_at: "2024-12-06T16:00:00",
  },
  {
    id: "7",
    title: "Bread4Soul Event",
    description: "Premium deep house event activation for Heineken Lager brand",
    brand_name: "Heineken Lager",
    location: "The Villa Durban",
    area: "Durban",
    start_datetime: "2025-02-01T18:00:00",
    end_datetime: "2025-02-01T23:00:00",
    required_workers: 2,
    assigned_workers: ["1", "2"], // Hope and Casey
    invited_workers: ["1", "2"],
    hourly_rate: 250,
    additional_fees: 100,
    call_time_minutes: 30,
    dress_code: "Smart casual, black attire preferred",
    photo_requirements: "Event photos, brand activation moments, consumer interactions",
    promotion_details: "Premium event activation targeting influential Durban socialites and deep house music lovers.",
    special_instructions: "Professional appearance required. Focus on brand visibility and social media moments.",
    status: "published",
    created_by: "manager-123",
    created_at: "2024-12-10T10:00:00",
    updated_at: "2024-12-10T10:00:00",
  },
]

export const getShifts = async (): Promise<Shift[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockShifts
}

export const createShift = async (shiftData: Omit<Shift, "id" | "created_at" | "updated_at">): Promise<Shift> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newShift: Shift = {
    ...shiftData,
    id: Date.now().toString(),
    assigned_workers: [],
    invited_workers: shiftData.invited_workers || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockShifts.push(newShift)
  return newShift
}

export const updateShift = async (id: string, updates: Partial<Shift>): Promise<Shift> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const shiftIndex = mockShifts.findIndex((shift) => shift.id === id)
  if (shiftIndex === -1) {
    throw new Error("Shift not found")
  }

  const updatedShift = {
    ...mockShifts[shiftIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  mockShifts[shiftIndex] = updatedShift
  return updatedShift
}

export const assignWorkerToShift = async (shiftId: string, workerId: string): Promise<Shift> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const shiftIndex = mockShifts.findIndex((shift) => shift.id === shiftId)
  if (shiftIndex === -1) {
    throw new Error("Shift not found")
  }

  const shift = mockShifts[shiftIndex]

  // Check if shift is already full
  if (shift.assigned_workers.length >= shift.required_workers) {
    throw new Error("Shift is already full")
  }

  // Add worker to assigned list if not already there
  if (!shift.assigned_workers.includes(workerId)) {
    shift.assigned_workers.push(workerId)
  }

  // Update status to full if we've reached the required number
  if (shift.assigned_workers.length >= shift.required_workers) {
    shift.status = "full"
  }

  shift.updated_at = new Date().toISOString()
  mockShifts[shiftIndex] = shift

  // Schedule reminders for the newly assigned worker
  const allWorkers = await import("@/lib/database").then((m) => m.getAllWorkers())
  const workersData = await allWorkers()
  await scheduleRemindersForShift(shift, [workerId], workersData)

  return shift
}

export const deleteShift = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const shiftIndex = mockShifts.findIndex((shift) => shift.id === id)
  if (shiftIndex === -1) {
    throw new Error("Shift not found")
  }

  mockShifts.splice(shiftIndex, 1)
}
