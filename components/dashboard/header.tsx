"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAllNotifications } from "@/lib/notifications-database"
import type { Notification } from "@/types/notifications"
import Image from "next/image"

export default function Header() {
  const { user, signOut } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const userNotifications = await getAllNotifications(user?.id || "")
      setNotifications(userNotifications)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)

    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "OM"
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 md:px-6 shadow-lg header-overlay">
      <div className="flex items-center">
        <Image
          src="/images/olive-mind-logo-complete.png"
          alt="Olive Mind Marketing"
          width={135}
          height={51}
          className="h-[51px] w-[135px]"
          style={{ height: "1.35cm", width: "3.58cm" }}
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative bg-white/80 hover:bg-white/90 border-green-200">
              <Bell className="h-5 w-5 text-green-700" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 content-overlay" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-green-600"
                  onClick={() => router.push("/dashboard/notifications")}
                >
                  View all ({notifications.length})
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              <>
                {notifications
                  .filter((_, index) => index < 5)
                  .map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                      <div className="flex w-full justify-between">
                        <span className="font-medium">{notification.title}</span>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-green-600"></span>}
                      </div>
                      <span className="text-sm text-muted-foreground">{notification.message}</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center hover:bg-green-50"
                    onClick={() => router.push("/dashboard/notifications")}
                  >
                    View all notifications
                  </Button>
                </DropdownMenuItem>
              </>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/80 hover:bg-white/90">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-green-100 text-green-700">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 content-overlay" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-green-50"
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-green-50"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? "Signing out..." : "Sign out"}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
