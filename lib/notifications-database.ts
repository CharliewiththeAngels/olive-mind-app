import type { Notification } from "@/types/notifications"

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "user1",
    title: "Shift Assignment",
    message: "You've been assigned to Woolworths Promotion on June 15, 2025",
    type: "shift",
    priority: "high",
    read: false,
    createdAt: new Date(2025, 5, 10).toISOString(),
    link: "/dashboard/calendar",
  },
  {
    id: "2",
    userId: "user1",
    title: "Payment Processed",
    message: "Your payment of R1,200 for Coca-Cola Activation has been processed",
    type: "payment",
    priority: "medium",
    read: true,
    createdAt: new Date(2025, 5, 8).toISOString(),
    link: "/dashboard/payments",
  },
  {
    id: "3",
    userId: "user1",
    title: "Report Reminder",
    message: "Please submit your report for Amstel Radler Promotion by end of day",
    type: "report",
    priority: "high",
    read: false,
    createdAt: new Date(2025, 5, 7).toISOString(),
    link: "/dashboard/reports",
  },
  {
    id: "4",
    userId: "user1",
    title: "Shift Reminder",
    message: "Your shift at Checkers Hyper starts tomorrow at 10:00 AM",
    type: "shift",
    priority: "medium",
    read: false,
    createdAt: new Date(2025, 5, 6).toISOString(),
    link: "/dashboard/calendar",
  },
  {
    id: "5",
    userId: "user1",
    title: "New Training Available",
    message: "New training brief for Heineken Promotion is available",
    type: "training",
    priority: "low",
    read: true,
    createdAt: new Date(2025, 5, 5).toISOString(),
    link: "/dashboard/briefs",
  },
  {
    id: "6",
    userId: "user1",
    title: "Payment Overdue",
    message: "Payment for Castle Lite Promotion is 3 days overdue",
    type: "payment",
    priority: "high",
    read: false,
    createdAt: new Date(2025, 5, 4).toISOString(),
    link: "/dashboard/payments",
  },
  {
    id: "7",
    userId: "user1",
    title: "Shift Cancelled",
    message: "Your shift at Pick n Pay on June 20 has been cancelled",
    type: "shift",
    priority: "high",
    read: true,
    createdAt: new Date(2025, 5, 3).toISOString(),
    link: "/dashboard/calendar",
  },
  {
    id: "8",
    userId: "user1",
    title: "Report Approved",
    message: "Your report for Savanna Promotion has been approved",
    type: "report",
    priority: "medium",
    read: false,
    createdAt: new Date(2025, 5, 2).toISOString(),
    link: "/dashboard/reports",
  },
  {
    id: "9",
    userId: "user1",
    title: "System Update",
    message: "New features added: Work Reports and Payment Tracking",
    type: "system",
    priority: "low",
    read: true,
    createdAt: new Date(2025, 5, 1).toISOString(),
    link: "/dashboard",
  },
  {
    id: "10",
    userId: "user1",
    title: "Profile Update Required",
    message: "Please update your profile with your new contact information",
    type: "profile",
    priority: "medium",
    read: false,
    createdAt: new Date(2025, 4, 30).toISOString(),
    link: "/dashboard/profile",
  },
  // Manager-specific notifications
  {
    id: "11",
    userId: "manager1",
    title: "New Worker Application",
    message: "New worker application from John Smith needs review",
    type: "workers",
    priority: "medium",
    read: false,
    createdAt: new Date(2025, 5, 9).toISOString(),
    link: "/dashboard/workers",
  },
  {
    id: "12",
    userId: "manager1",
    title: "Shift Coverage Alert",
    message: "Woolworths Promotion on June 18 needs 2 more workers",
    type: "shift",
    priority: "high",
    read: false,
    createdAt: new Date(2025, 5, 8).toISOString(),
    link: "/dashboard/calendar",
  },
]

// Get all notifications for a user
export const getAllNotifications = async (userId: string): Promise<Notification[]> => {
  // In a real app, this would fetch from Supabase
  // For now, we'll filter the mock data

  // For demo purposes, if userId contains "manager", return manager notifications
  // Otherwise return worker notifications
  if (userId.includes("manager")) {
    return [
      ...mockNotifications.filter((n) => n.userId === "manager1"),
      ...mockNotifications.filter((n) => n.userId === "user1"),
    ]
  }

  return mockNotifications.filter((n) => n.userId === "user1")
}

// Mark a notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  // In a real app, this would update Supabase
  console.log(`Marking notification ${notificationId} as read`)
  // We don't need to update the mock data since we're handling state in the component
}

// Mark all notifications as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  // In a real app, this would update Supabase
  console.log(`Marking all notifications for user ${userId} as read`)
  // We don't need to update the mock data since we're handling state in the component
}

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  // In a real app, this would update Supabase
  console.log(`Deleting notification ${notificationId}`)
  // We don't need to update the mock data since we're handling state in the component
}

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, "id" | "createdAt">,
): Promise<Notification> => {
  // In a real app, this would insert into Supabase
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
  }

  console.log(`Creating new notification: ${newNotification.title}`)
  return newNotification
}

// Update notification preferences
export const updateNotificationPreferences = async (userId: string, preferences: any): Promise<void> => {
  // In a real app, this would update Supabase
  console.log(`Updating notification preferences for user ${userId}`, preferences)
}
