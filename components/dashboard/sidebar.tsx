"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Users, Calendar, FileText, DollarSign, Bell, ClipboardList, BookOpen } from "lucide-react"
import Image from "next/image"
import { useSupabase } from "@/lib/supabase-provider"
import { getUserRole } from "@/lib/supabase-server"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Workers",
    href: "/dashboard/workers",
    icon: Users,
    managerOnly: true,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: ClipboardList,
  },
  {
    title: "Work Briefs",
    href: "/dashboard/briefs",
    icon: BookOpen,
  },
  {
    title: "Work Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: DollarSign,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useSupabase()
  const userRole = getUserRole(user?.email)
  const canViewManagerFeatures = userRole === "manager" || userRole === "promoter_manager"

  const filteredNavItems = sidebarNavItems.filter(
    (item) => !item.managerOnly || (item.managerOnly && canViewManagerFeatures),
  )

  return (
    <div className="flex h-full w-64 flex-col sidebar-overlay">
      <div className="flex h-16 items-center border-b border-green-200/30 px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
          <Image
            src="/images/olive-mind-logo-complete.png"
            alt="Olive Mind Marketing"
            width={135}
            height={51}
            className="h-[51px] w-[135px]"
            style={{ height: "1.35cm", width: "3.58cm" }}
          />
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {filteredNavItems.map((item, index) => (
            <Button
              key={index}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200",
                pathname === item.href
                  ? "bg-green-100/80 text-green-800 hover:bg-green-200/80 shadow-sm"
                  : "text-green-700 hover:bg-green-50/80 hover:text-green-800",
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Role Indicator */}
      {userRole === "promoter_manager" && (
        <div className="px-3 pb-3">
          <div className="bg-blue-50/80 border border-blue-200/50 rounded-lg p-2 text-center">
            <span className="text-xs font-medium text-blue-700">Promoter Manager</span>
            <div className="text-xs text-blue-600 mt-1">Read-Only Access</div>
          </div>
        </div>
      )}
    </div>
  )
}
