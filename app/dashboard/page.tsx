"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Clock, CheckCircle, Calendar, FileText, UserPlus, BarChart3 } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { useSupabase } from "@/lib/supabase-provider"
import { getAllWorkers, type Worker } from "@/lib/database"
import { getShifts, type Shift } from "@/lib/shifts-database"
import { getWorkBriefs, type WorkBrief } from "@/lib/work-briefs-database"
import { getPayments, type Payment } from "@/lib/payments-database"

export default function DashboardPage() {
  const { user } = useSupabase()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [briefs, setBriefs] = useState<WorkBrief[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const isManager = user?.email === "Mtsand09@gmail.com"
  const isPromoterManager = user?.email === "promoter@olivemind.com"
  const currentUserId = user?.id || ""

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [workersData, shiftsData, briefsData, paymentsData] = await Promise.all([
          getAllWorkers(),
          getShifts(),
          getWorkBriefs(),
          getPayments(),
        ])

        setWorkers(workersData)
        setShifts(shiftsData)
        setBriefs(briefsData)
        setPayments(paymentsData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Filter data based on user role
  const getFilteredData = () => {
    if (isManager) {
      return { workers, shifts, briefs, payments }
    }

    if (isPromoterManager) {
      return { workers, shifts, briefs, payments }
    }

    // Worker view - only their own data
    const worker = workers.find((w) => w.email === user?.email)
    const workerShifts = shifts.filter((shift) => shift.assigned_workers.includes(currentUserId))
    const workerBriefs = briefs.filter((brief) => workerShifts.some((shift) => shift.id === brief.shift_id))
    const workerPayments = payments.filter((payment) => payment.worker_id === worker?.id)

    return {
      workers: worker ? [worker] : [],
      shifts: workerShifts,
      briefs: workerBriefs,
      payments: workerPayments,
    }
  }

  const {
    workers: filteredWorkers,
    shifts: filteredShifts,
    briefs: filteredBriefs,
    payments: filteredPayments,
  } = getFilteredData()

  // Calculate metrics
  const totalWorkers = filteredWorkers.length
  const activeWorkers = filteredWorkers.filter((w) => w.status === "active").length
  const totalShifts = filteredShifts.length
  const upcomingShifts = filteredShifts.filter((shift) => new Date(shift.start_datetime) > new Date()).length
  const totalBriefs = filteredBriefs.length
  const publishedBriefs = filteredBriefs.filter((brief) => brief.status === "published").length

  // Recent activity for managers
  const getRecentActivity = () => {
    const activities = []

    // Recent shifts (last 7 days)
    const recentShifts = filteredShifts
      .filter((shift) => {
        const shiftDate = new Date(shift.start_datetime)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return shiftDate >= weekAgo
      })
      .slice(0, 3)

    recentShifts.forEach((shift) => {
      activities.push({
        id: shift.id,
        type: "shift",
        title: `Shift: ${shift.title}`,
        description: `${shift.brand_name} • ${format(new Date(shift.start_datetime), "MMM d, h:mm a")}`,
        time: shift.created_at,
        icon: Calendar,
      })
    })

    // Recent briefs
    const recentBriefs = filteredBriefs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)

    recentBriefs.forEach((brief) => {
      activities.push({
        id: brief.id,
        type: "brief",
        title: `Work Brief: ${brief.title}`,
        description: `${brief.brand_name} • ${brief.status}`,
        time: brief.created_at,
        icon: FileText,
      })
    })

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
  }

  const recentActivity = getRecentActivity()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{isManager ? ", Manager" : isPromoterManager ? ", Promoter Manager" : ""}!
          </h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Here's what's happening with your workforce today."
              : isPromoterManager
                ? "Monitor workforce activities and performance."
                : "Check your upcoming shifts and training materials."}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {format(new Date(), "EEEE, MMM d")}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isManager || isPromoterManager ? "Total Workers" : "Your Profile"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              {isManager || isPromoterManager ? `${activeWorkers} active workers` : "Profile complete"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isManager || isPromoterManager ? "Scheduled Shifts" : "Your Shifts"}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingShifts > 0 ? `${upcomingShifts} upcoming` : "No upcoming shifts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Briefs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBriefs}</div>
            <p className="text-xs text-muted-foreground">
              {publishedBriefs > 0 ? `${publishedBriefs} published` : "No briefs available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">All Clear</div>
            <p className="text-xs text-muted-foreground">No outstanding payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        {(isManager || isPromoterManager) && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Worker
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule New Shift
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Create Work Brief
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className={isManager || isPromoterManager ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {isManager || isPromoterManager ? "Latest workforce activities" : "Your recent activities"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.time), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground">
                  {isManager || isPromoterManager
                    ? "Start by creating shifts or work briefs"
                    : "Check back when you have assigned shifts"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Application health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Payments</span>
              <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Workers</span>
              <Badge className="bg-green-100 text-green-800">{activeWorkers} Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming This Week */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Upcoming shifts and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingShifts > 0 ? (
              <div className="space-y-3">
                {filteredShifts
                  .filter((shift) => {
                    const shiftDate = new Date(shift.start_datetime)
                    const weekFromNow = new Date()
                    weekFromNow.setDate(weekFromNow.getDate() + 7)
                    return shiftDate >= new Date() && shiftDate <= weekFromNow
                  })
                  .slice(0, 3)
                  .map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-sm text-muted-foreground">{shift.brand_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(shift.start_datetime), "EEE, MMM d • h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {isToday(new Date(shift.start_datetime))
                          ? "Today"
                          : isTomorrow(new Date(shift.start_datetime))
                            ? "Tomorrow"
                            : format(new Date(shift.start_datetime), "MMM d")}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No shifts scheduled this week</p>
                <p className="text-xs text-muted-foreground">
                  {isManager || isPromoterManager ? "Create new shifts in the calendar" : "Check back later"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
