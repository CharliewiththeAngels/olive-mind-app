"use client"

export interface ShiftReminder {
  id: string
  shift_id: string
  worker_id: string
  reminder_type: "day_before" | "shift_day"
  scheduled_for: string
  sent_at: string | null
  status: "scheduled" | "sent" | "failed"
  message: string
  created_at: string
}

// Mock reminders data
const mockReminders: ShiftReminder[] = []

export const getReminders = async (): Promise<ShiftReminder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReminders
}

export const getRemindersByShift = async (shiftId: string): Promise<ShiftReminder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReminders.filter((reminder) => reminder.shift_id === shiftId)
}

export const getRemindersByWorker = async (workerId: string): Promise<ShiftReminder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReminders.filter((reminder) => reminder.worker_id === workerId)
}

export const createReminder = async (
  reminderData: Omit<ShiftReminder, "id" | "sent_at" | "status" | "created_at">,
): Promise<ShiftReminder> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newReminder: ShiftReminder = {
    ...reminderData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    sent_at: null,
    status: "scheduled",
    created_at: new Date().toISOString(),
  }

  mockReminders.push(newReminder)
  return newReminder
}

export const markReminderAsSent = async (reminderId: string): Promise<ShiftReminder> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const reminderIndex = mockReminders.findIndex((reminder) => reminder.id === reminderId)
  if (reminderIndex === -1) {
    throw new Error("Reminder not found")
  }

  const updatedReminder = {
    ...mockReminders[reminderIndex],
    status: "sent" as const,
    sent_at: new Date().toISOString(),
  }

  mockReminders[reminderIndex] = updatedReminder
  return updatedReminder
}

export const deleteRemindersByShift = async (shiftId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  for (let i = mockReminders.length - 1; i >= 0; i--) {
    if (mockReminders[i].shift_id === shiftId) {
      mockReminders.splice(i, 1)
    }
  }
}
