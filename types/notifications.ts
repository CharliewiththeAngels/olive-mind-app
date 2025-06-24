export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "shift" | "payment" | "report" | "system" | "profile" | "training" | "workers"
  priority: "high" | "medium" | "low"
  read: boolean
  createdAt: string
  link?: string
}

export interface NotificationPreferences {
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  types: {
    shifts: boolean
    payments: boolean
    reports: boolean
    system: boolean
  }
  frequency: "immediate" | "daily" | "weekly"
}
