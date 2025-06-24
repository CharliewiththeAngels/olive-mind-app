"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Calendar, CreditCard, FileText, Search, Trash2, Clock } from "lucide-react"

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    userId: "hope@olivemind.com",
    type: "shift",
    title: "New Shift Assignment",
    message: "You've been assigned to Woolworths Promotion at Sandton City Mall on January 15, 2025",
    priority: "high",
    read: false,
    createdAt: new Date("2025-01-10T10:00:00Z"),
    actionUrl: "/dashboard/calendar",
  },
  {
    id: "2",
    userId: "hope@olivemind.com",
    type: "shift",
    title: "Shift Reminder",
    message: "Reminder: Your shift at Coca-Cola Activation starts tomorrow at 9:00 AM",
    priority: "medium",
    read: false,
    createdAt: new Date("2025-01-09T18:00:00Z"),
    actionUrl: "/dashboard/schedule",
  },
  {
    id: "3",
    userId: "hope@olivemind.com",
    type: "payment",
    title: "Payment Processed",
    message: "Your payment of R1,200 for Heineken Event has been processed successfully",
    priority: "medium",
    read: true,
    createdAt: new Date("2025-01-08T14:30:00Z"),
    actionUrl: "/dashboard/payments",
  },
  {
    id: "4",
    userId: "hope@olivemind.com",
    type: "report",
    title: "Report Submission Required",
    message: "Please submit your work report for Amstel Radler Promotion by end of day",
    priority: "high",
    read: false,
    createdAt: new Date("2025-01-07T16:00:00Z"),
    actionUrl: "/dashboard/reports",
  },
  {
    id: "5",
    userId: "casey@olivemind.com",
    type: "shift",
    title: "Shift Cancelled",
    message: "Your shift at Pick n Pay Activation on January 12 has been cancelled due to weather",
    priority: "high",
    read: false,
    createdAt: new Date("2025-01-06T12:00:00Z"),
    actionUrl: "/dashboard/calendar",
  },
  {
    id: "6",
    userId: "casey@olivemind.com",
    type: "payment",
    title: "Payment Pending",
    message: "Your payment of R800 for Coca-Cola Event is being processed",
    priority: "low",
    read: true,
    createdAt: new Date("2025-01-05T11:00:00Z"),
    actionUrl: "/dashboard/payments",
  },
]

interface Notification {
  id: string
  userId: string
  type: "shift" | "payment" | "report" | "system"
  title: string
  message: string
  priority: "high" | "medium" | "low"
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export default function NotificationsPage() {
  const { user } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      // Filter notifications for current user
      const userNotifications = mockNotifications.filter((n) => n.userId === user.email)
      setNotifications(userNotifications)
      setFilteredNotifications(userNotifications)
    }
  }, [user])

  useEffect(() => {
    filterNotifications(selectedTab, searchQuery)
  }, [notifications, selectedTab, searchQuery])

  const filterNotifications = (tab: string, query: string) => {
    let filtered = [...notifications]

    // Filter by tab
    if (tab === "unread") {
      filtered = filtered.filter((notification) => !notification.read)
    } else if (tab === "shifts") {
      filtered = filtered.filter((notification) => notification.type === "shift")
    } else if (tab === "payments") {
      filtered = filtered.filter((notification) => notification.type === "payment")
    } else if (tab === "reports") {
      filtered = filtered.filter((notification) => notification.type === "report")
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(lowerQuery) ||
          notification.message.toLowerCase().includes(lowerQuery),
      )
    }

    setFilteredNotifications(filtered)
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(id)) {
        return prev.filter((notificationId) => notificationId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleDeleteSelected = () => {
    setNotifications((prev) => prev.filter((notification) => !selectedNotifications.includes(notification.id)))
    setSelectedNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "shift":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />
      case "report":
        return <FileText className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "No unread notifications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedNotifications.length > 0 ? (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedNotifications.length})
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="shifts">
                <Calendar className="mr-2 h-4 w-4" />
                Shifts
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="mr-3 pt-1">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => handleSelectNotification(notification.id)}
                      />
                    </div>
                    <div className="mr-3 pt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                            <Badge
                              variant={notification.priority === "high" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.read && (
                            <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                              Mark as read
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
