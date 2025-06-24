"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, DollarSign, Search, Eye, Edit } from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { useSupabase } from "@/lib/supabase-provider"
import { getShifts, type Shift } from "@/lib/shifts-database"
import { getAllWorkers, type Worker } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"

export default function SchedulePage() {
  const { user } = useSupabase()
  const { toast } = useToast()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("upcoming")

  const isManager = user?.email === "Mtsand09@gmail.com"
  const currentUserId = user?.id || ""

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [shiftsData, workersData] = await Promise.all([getShifts(), getAllWorkers()])
      setShifts(shiftsData)
      setWorkers(workersData)
    } catch (error) {
      toast({
        title: "Error loading schedule",
        description: "Failed to load schedule data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter shifts based on user role and filters
  const getFilteredShifts = () => {
    let filteredShifts = shifts

    // Role-based filtering
    if (!isManager) {
      // Workers only see shifts they're assigned to
      filteredShifts = shifts.filter((shift) => shift.assigned_workers.includes(currentUserId))
    }

    // Time-based filtering
    const now = new Date()
    const nextWeek = addDays(now, 7)
    const nextMonth = addDays(now, 30)

    switch (timeFilter) {
      case "upcoming":
        filteredShifts = filteredShifts.filter((shift) => isAfter(new Date(shift.start_datetime), now))
        break
      case "next_week":
        filteredShifts = filteredShifts.filter(
          (shift) => isAfter(new Date(shift.start_datetime), now) && isBefore(new Date(shift.start_datetime), nextWeek),
        )
        break
      case "next_month":
        filteredShifts = filteredShifts.filter(
          (shift) =>
            isAfter(new Date(shift.start_datetime), now) && isBefore(new Date(shift.start_datetime), nextMonth),
        )
        break
      case "past":
        filteredShifts = filteredShifts.filter((shift) => isBefore(new Date(shift.start_datetime), now))
        break
      default:
        break
    }

    // Status filtering
    if (statusFilter !== "all") {
      filteredShifts = filteredShifts.filter((shift) => shift.status === statusFilter)
    }

    // Search filtering
    if (searchTerm) {
      filteredShifts = filteredShifts.filter(
        (shift) =>
          shift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.area.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort by start date (upcoming first)
    return filteredShifts.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
  }

  const getWorkerById = (workerId: string) => {
    return workers.find((w) => w.id === workerId)
  }

  const getAssignedWorkerNames = (workerIds: string[]) => {
    return workerIds
      .map((id) => getWorkerById(id)?.full_name)
      .filter(Boolean)
      .join(", ")
  }

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 100)) / 10
    return `${hours} hours`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "full":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredShifts = getFilteredShifts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Schedule</h1>
          <p className="text-muted-foreground">
            {isManager ? "View and manage all upcoming work shifts" : "Your assigned work shifts and schedule"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isManager ? "Total Upcoming Shifts" : "Your Upcoming Shifts"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredShifts.filter(
                  (shift) => isAfter(new Date(shift.start_datetime), new Date()) && shift.status !== "cancelled",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredShifts.filter(
                  (shift) =>
                    isAfter(new Date(shift.start_datetime), new Date()) &&
                    isBefore(new Date(shift.start_datetime), addDays(new Date(), 7)) &&
                    shift.status !== "cancelled",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "Workers Needed" : "Total Hours"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isManager
                ? filteredShifts
                    .filter(
                      (shift) => isAfter(new Date(shift.start_datetime), new Date()) && shift.status === "published",
                    )
                    .reduce((sum, shift) => sum + (shift.required_workers - shift.assigned_workers.length), 0)
                : filteredShifts
                    .filter(
                      (shift) => isAfter(new Date(shift.start_datetime), new Date()) && shift.status !== "cancelled",
                    )
                    .reduce((sum, shift) => {
                      const hours =
                        Math.round(
                          (new Date(shift.end_datetime).getTime() - new Date(shift.start_datetime).getTime()) /
                            (1000 * 60 * 60 * 100),
                        ) / 10
                      return sum + hours
                    }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">{isManager ? "Open positions" : "Scheduled hours"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "Total Value" : "Estimated Earnings"}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R
              {filteredShifts
                .filter((shift) => isAfter(new Date(shift.start_datetime), new Date()) && shift.status !== "cancelled")
                .reduce((sum, shift) => {
                  const hours =
                    Math.round(
                      (new Date(shift.end_datetime).getTime() - new Date(shift.start_datetime).getTime()) /
                        (1000 * 60 * 60 * 100),
                    ) / 10
                  return sum + hours * shift.hourly_rate + shift.additional_fees
                }, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Upcoming shifts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isManager ? "All Shifts" : "Your Schedule"} ({filteredShifts.length})
          </CardTitle>
          <CardDescription>
            {isManager
              ? "Complete overview of all work shifts and assignments"
              : "Your confirmed work assignments and upcoming shifts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shifts, brands, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="next_week">Next 7 Days</SelectItem>
                <SelectItem value="next_month">Next 30 Days</SelectItem>
                <SelectItem value="past">Past Shifts</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule List */}
          <div className="space-y-4">
            {filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => (
                <div key={shift.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{shift.title}</h3>
                          <p className="text-sm text-muted-foreground">{shift.brand_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(shift.status)}>{shift.status}</Badge>
                          {isManager && (
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date & Time */}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {format(new Date(shift.start_datetime), "EEE, MMM d")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(shift.start_datetime), "HH:mm")} -{" "}
                              {format(new Date(shift.end_datetime), "HH:mm")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getShiftDuration(shift.start_datetime, shift.end_datetime)}
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{shift.area}</div>
                            <div className="text-xs text-muted-foreground">{shift.location}</div>
                          </div>
                        </div>

                        {/* Workers */}
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {shift.assigned_workers.length} / {shift.required_workers} workers
                            </div>
                            {shift.assigned_workers.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {isManager ? getAssignedWorkerNames(shift.assigned_workers) : "You are assigned"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">R{shift.hourly_rate}/hour</div>
                            {shift.additional_fees > 0 && (
                              <div className="text-xs text-muted-foreground">+R{shift.additional_fees} fees</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Total: R
                              {(
                                (Math.round(
                                  (new Date(shift.end_datetime).getTime() - new Date(shift.start_datetime).getTime()) /
                                    (1000 * 60 * 60 * 100),
                                ) /
                                  10) *
                                  shift.hourly_rate +
                                shift.additional_fees
                              ).toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Workers (Manager View) */}
                      {isManager && shift.assigned_workers.length > 0 && (
                        <div className="border-t pt-3">
                          <div className="text-sm font-medium mb-2">Assigned Workers:</div>
                          <div className="flex flex-wrap gap-2">
                            {shift.assigned_workers.map((workerId) => {
                              const worker = getWorkerById(workerId)
                              if (!worker) return null
                              return (
                                <div
                                  key={workerId}
                                  className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={worker.profile_pictures?.[0] || "/placeholder.svg"}
                                      alt={worker.full_name}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {worker.full_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{worker.full_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {worker.area}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {shift.description && (
                        <div className="border-t pt-3">
                          <p className="text-sm text-muted-foreground">{shift.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No shifts found</h3>
                <p className="text-muted-foreground">
                  {isManager
                    ? "No shifts match your current filters."
                    : "You don't have any assigned shifts matching the current filters."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
