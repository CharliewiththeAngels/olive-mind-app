"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Calendar, Check, CreditCard, FileText, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/types/notifications"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getIcon = () => {
    switch (notification.type) {
      case "shift":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />
      case "report":
        return <FileText className="h-5 w-5 text-amber-500" />
      case "workers":
        return <Users className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityClass = () => {
    switch (notification.priority) {
      case "high":
        return "bg-red-100 border-red-300"
      case "medium":
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const handleClick = () => {
    setIsExpanded(!isExpanded)
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={`flex flex-1 cursor-pointer flex-col rounded-md border p-3 transition-all ${
        notification.read ? "bg-white" : getPriorityClass()
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">{getIcon()}</div>
          <div>
            <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
              {notification.title}
              {!notification.read && <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-600"></span>}
            </h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
            {isExpanded && notification.link && (
              <a
                href={notification.link}
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View details
              </a>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification.id)
              }}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
