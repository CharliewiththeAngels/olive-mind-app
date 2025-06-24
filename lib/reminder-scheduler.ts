"use client"

import { format, subDays, subHours, isBefore } from "date-fns"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"
import { createReminder, deleteRemindersByShift } from "@/lib/reminders-database"

export const generateReminderMessage = (
  shift: Shift,
  worker: Worker,
  reminderType: "day_before" | "shift_day",
): string => {
  const startDate = new Date(shift.start_datetime)
  const endDate = new Date(shift.end_datetime)
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100)) / 10

  if (reminderType === "day_before") {
    return `*Work Reminder - Tomorrow*

Hello ${worker.full_name},

This is a reminder about your work shift tomorrow:

*Shift Details:*
*Title:* ${shift.title}
*Brand:* ${shift.brand_name}
*Location:* ${shift.location}
*Date:* ${format(startDate, "EEEE d MMMM yyyy")}
*Time:* ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")} (${duration} hours)
*Call Time:* ${shift.call_time_minutes} minutes before start time

*Dress Code:* ${shift.dress_code}

*Important Reminders:*
• ${shift.photo_requirements}
• Please ensure that your phone is fully charged and also bring a power bank or a charger
• Arrive ${shift.call_time_minutes} minutes early for call time

See you tomorrow!

Olive Mind Marketing Team`
  } else {
    return `*Work Shift Today - Check-in*

Hello ${worker.full_name},

Is everything on track for your work shift?

*Today's Shift:*
*Title:* ${shift.title}
*Brand:* ${shift.brand_name}
*Location:* ${shift.location}
*Time:* ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}
*Call Time:* ${shift.call_time_minutes} minutes before start time

Please confirm you're ready and on your way.

Olive Mind Marketing Team`
  }
}

export const calculateReminderTimes = (shiftStartTime: string) => {
  const startDate = new Date(shiftStartTime)
  const startHour = startDate.getHours()

  // Day before reminder - always at 18:00 the day before
  const dayBeforeReminder = subDays(startDate, 1)
  dayBeforeReminder.setHours(18, 0, 0, 0)

  // Shift day reminder - based on start time
  let shiftDayReminder: Date
  if (startHour >= 11) {
    // 4 hours before if shift starts at 11:00 AM or later
    shiftDayReminder = subHours(startDate, 4)
  } else {
    // 2 hours before if shift starts before 11:00 AM
    shiftDayReminder = subHours(startDate, 2)
  }

  return {
    dayBefore: dayBeforeReminder,
    shiftDay: shiftDayReminder,
  }
}

export const scheduleRemindersForShift = async (shift: Shift, workerIds: string[], workers: Worker[]) => {
  try {
    // Delete existing reminders for this shift
    await deleteRemindersByShift(shift.id)

    const reminderTimes = calculateReminderTimes(shift.start_datetime)
    const now = new Date()

    for (const workerId of workerIds) {
      const worker = workers.find((w) => w.id === workerId)
      if (!worker) continue

      // Schedule day before reminder if it's in the future
      if (isBefore(now, reminderTimes.dayBefore)) {
        await createReminder({
          shift_id: shift.id,
          worker_id: workerId,
          reminder_type: "day_before",
          scheduled_for: reminderTimes.dayBefore.toISOString(),
          message: generateReminderMessage(shift, worker, "day_before"),
        })
      }

      // Schedule shift day reminder if it's in the future
      if (isBefore(now, reminderTimes.shiftDay)) {
        await createReminder({
          shift_id: shift.id,
          worker_id: workerId,
          reminder_type: "shift_day",
          scheduled_for: reminderTimes.shiftDay.toISOString(),
          message: generateReminderMessage(shift, worker, "shift_day"),
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error scheduling reminders:", error)
    return false
  }
}

export const processScheduledReminders = async () => {
  // This would be called by a background job/cron
  // For demo purposes, we'll simulate it
  console.log("Processing scheduled reminders...")
  // Implementation would check for reminders due now and send them
}
