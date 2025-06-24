// This file contains the database functions for payments

import { v4 as uuidv4 } from "uuid"

// Payment status types
export type PaymentStatus = "pending" | "processing" | "paid" | "overdue"

// Payment interface
export interface Payment {
  id: string
  worker_id: string
  shift_id: string
  shift_title: string
  brand_name: string
  shift_date: string
  hours_worked: number
  hourly_rate: number
  amount: number
  additional_amount: number // Changed from bonus_amount
  deduction_amount: number
  status: PaymentStatus
  payment_due_date: string
  payment_date?: string
  payment_reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Mock payments data
const payments: Payment[] = [
  {
    id: "1",
    worker_id: "1",
    shift_id: "101",
    shift_title: "Woolworths Promotion",
    brand_name: "Woolworths",
    shift_date: "2025-05-15",
    hours_worked: 4,
    hourly_rate: 200,
    amount: 800,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-05-22",
    payment_date: "2025-05-20",
    payment_reference: "WP-20250520-001",
    created_at: "2025-05-15",
    updated_at: "2025-05-20",
  },
  {
    id: "2",
    worker_id: "1",
    shift_id: "102",
    shift_title: "Coca-Cola Summer Activation",
    brand_name: "Coca-Cola",
    shift_date: "2025-05-18",
    hours_worked: 6,
    hourly_rate: 220,
    amount: 1320,
    additional_amount: 100, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-05-25",
    payment_date: "2025-05-24",
    payment_reference: "CC-20250524-002",
    notes: "Additional payment for excellent customer engagement", // Changed from "Performance bonus"
    created_at: "2025-05-18",
    updated_at: "2025-05-24",
  },
  {
    id: "3",
    worker_id: "2",
    shift_id: "103",
    shift_title: "Amstel Radler Launch",
    brand_name: "Amstel",
    shift_date: "2025-05-20",
    hours_worked: 5,
    hourly_rate: 250,
    amount: 1250,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 0,
    status: "pending",
    payment_due_date: "2025-05-27",
    created_at: "2025-05-20",
    updated_at: "2025-05-20",
  },
  {
    id: "4",
    worker_id: "3",
    shift_id: "104",
    shift_title: "Heineken Lager Promotion",
    brand_name: "Heineken",
    shift_date: "2025-05-10",
    hours_worked: 8,
    hourly_rate: 280,
    amount: 2240,
    additional_amount: 300, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-05-17",
    payment_date: "2025-05-16",
    payment_reference: "HL-20250516-003",
    notes: "Additional payment for premium event", // Changed from "Premium event bonus"
    created_at: "2025-05-10",
    updated_at: "2025-05-16",
  },
  {
    id: "5",
    worker_id: "4",
    shift_id: "105",
    shift_title: "Bread4Soul Event",
    brand_name: "Heineken",
    shift_date: "2025-02-01",
    hours_worked: 10,
    hourly_rate: 300,
    amount: 3000,
    additional_amount: 500, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-02-08",
    payment_date: "2025-02-07",
    payment_reference: "BS-20250207-004",
    notes: "Premium event with excellent performance",
    created_at: "2025-02-01",
    updated_at: "2025-02-07",
  },
  {
    id: "6",
    worker_id: "2",
    shift_id: "106",
    shift_title: "Savanna Promotion",
    brand_name: "Savanna",
    shift_date: "2025-05-05",
    hours_worked: 4,
    hourly_rate: 220,
    amount: 880,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 50,
    status: "overdue",
    payment_due_date: "2025-05-12",
    notes: "Deduction for late arrival",
    created_at: "2025-05-05",
    updated_at: "2025-05-05",
  },
  {
    id: "7",
    worker_id: "5",
    shift_id: "107",
    shift_title: "Castle Lite Activation",
    brand_name: "Castle Lite",
    shift_date: "2025-05-22",
    hours_worked: 6,
    hourly_rate: 250,
    amount: 1500,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 0,
    status: "processing",
    payment_due_date: "2025-05-29",
    created_at: "2025-05-22",
    updated_at: "2025-05-23",
  },
  {
    id: "8",
    worker_id: "1",
    shift_id: "108",
    shift_title: "Windhoek Beer Tasting",
    brand_name: "Windhoek",
    shift_date: "2025-05-25",
    hours_worked: 5,
    hourly_rate: 230,
    amount: 1150,
    additional_amount: 50, // Changed from bonus_amount
    deduction_amount: 0,
    status: "pending",
    payment_due_date: "2025-06-01",
    notes: "Additional payment for customer feedback", // Changed from "Small bonus"
    created_at: "2025-05-25",
    updated_at: "2025-05-25",
  },
  {
    id: "9",
    worker_id: "3",
    shift_id: "109",
    shift_title: "Flying Fish Promotion",
    brand_name: "Flying Fish",
    shift_date: "2025-04-15",
    hours_worked: 4,
    hourly_rate: 200,
    amount: 800,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-04-22",
    payment_date: "2025-04-21",
    payment_reference: "FF-20250421-005",
    created_at: "2025-04-15",
    updated_at: "2025-04-21",
  },
  {
    id: "10",
    worker_id: "4",
    shift_id: "110",
    shift_title: "Brutal Fruit Launch",
    brand_name: "Brutal Fruit",
    shift_date: "2025-04-20",
    hours_worked: 6,
    hourly_rate: 220,
    amount: 1320,
    additional_amount: 0, // Changed from bonus_amount
    deduction_amount: 0,
    status: "paid",
    payment_due_date: "2025-04-27",
    payment_date: "2025-04-26",
    payment_reference: "BF-20250426-006",
    created_at: "2025-04-20",
    updated_at: "2025-04-26",
  },
]

// Get all payments
export async function getPayments(): Promise<Payment[]> {
  return [...payments]
}

// Get payment by ID
export async function getPaymentById(id: string): Promise<Payment | undefined> {
  return payments.find((payment) => payment.id === id)
}

// Get payments by worker ID
export async function getPaymentsByWorkerId(workerId: string): Promise<Payment[]> {
  return payments.filter((payment) => payment.worker_id === workerId)
}

// Create a new payment
export async function createPayment(paymentData: Omit<Payment, "id" | "created_at" | "updated_at">): Promise<Payment> {
  const newPayment: Payment = {
    id: uuidv4(),
    ...paymentData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  payments.push(newPayment)
  return newPayment
}

// Update payment status
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  reference?: string,
): Promise<Payment | undefined> {
  const paymentIndex = payments.findIndex((payment) => payment.id === id)

  if (paymentIndex === -1) return undefined

  const updatedPayment = {
    ...payments[paymentIndex],
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "paid") {
    updatedPayment.payment_date = new Date().toISOString()
    if (reference) {
      updatedPayment.payment_reference = reference
    }
  }

  payments[paymentIndex] = updatedPayment
  return updatedPayment
}

// Delete payment
export async function deletePayment(id: string): Promise<boolean> {
  const paymentIndex = payments.findIndex((payment) => payment.id === id)

  if (paymentIndex === -1) return false

  payments.splice(paymentIndex, 1)
  return true
}
