"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Camera, FileText, MapPin, Calendar, Users, CheckCircle, AlertCircle, Eye } from "lucide-react"
import { getWorkReports, type WorkReport } from "@/lib/work-reports-database"
import { getShifts, type Shift } from "@/lib/shifts-database"
import { getAllWorkers, type Worker } from "@/lib/database"
import { CheckInDialog } from "@/components/reports/check-in-dialog"
import { CheckOutDialog } from "@/components/reports/check-out-dialog"
import { ViewReportDialog } from "@/components/reports/view-report-dialog"
import { format } from "date-fns"

export default function WorkReportsPage() {
  const { user } = useSupabase()
  const isManager = user?.email === "Mtsand09@gmail.com"

  const [reports, setReports] = useState<WorkReport[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null)
  const [viewReportOpen, setViewReportOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsData, shiftsData, workersData] = await Promise.all([
          getWorkReports(),
          getShifts(),
          getAllWorkers(),
        ])
        setReports(reportsData)
        setShifts(shiftsData)
        setWorkers(workersData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter reports based on role
  const filteredReports = reports.filter((report) => {
    if (!isManager) {
      // Workers only see their own reports
      const worker = workers.find((w) => w.email === user?.email)
      if (!worker || report.promoter_id !== worker.id) return false
    }

    // Apply search and status filters
    const shift = shifts.find((s) => s.id === report.shift_id)
    const worker = workers.find((w) => w.id === report.promoter_id)

    const matchesSearch =
      !searchTerm ||
      shift?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift?.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked-in" && report.check_in_time && !report.check_out_time) ||
      (statusFilter === "completed" && report.check_in_time && report.check_out_time) ||
      (statusFilter === "pending" && !report.check_in_time)

    return matchesSearch && matchesStatus
  })

  // Get current worker's active shifts (for check-in)
  const currentWorker = workers.find((w) => w.email === user?.email)
  const activeShifts = shifts.filter((shift) => {
    if (!currentWorker) return false

    // Only show shifts assigned to current worker that haven't been checked into yet
    const isAssigned = shift.assigned_workers.includes(currentWorker.id)
    const hasReport = reports.some((r) => r.shift_id === shift.id && r.promoter_id === currentWorker.id)
    const shiftDate = new Date(shift.start_datetime)
    const today = new Date()
    const isToday = shiftDate.toDateString() === today.toDateString()

    return isAssigned && !hasReport && isToday
  })

  // Get shifts worker is currently checked into (for check-out)
  const checkedInShifts = reports
    .filter((report) => {
      if (!currentWorker) return false
      return report.promoter_id === currentWorker.id && report.check_in_time && !report.check_out_time
    })
    .map((report) => shifts.find((s) => s.id === report.shift_id))
    .filter(Boolean) as Shift[]

  const handleViewReport = (report: WorkReport) => {
    setSelectedReport(report)
    setViewReportOpen(true)
  }

  const handleReportUpdate = () => {
    // Refresh reports after check-in/out
    const fetchReports = async () => {
      const reportsData = await getWorkReports()
      setReports(reportsData)
    }
    fetchReports()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading work reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Reports</h1>
          <p className="text-muted-foreground">
            {isManager ? "Manage worker check-ins and work reports" : "Your work reports and check-in status"}
          </p>
        </div>
      </div>

      {/* Worker Quick Actions */}
      {!isManager && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Check In to Shift
              </CardTitle>
              <CardDescription>Start your work day by checking in</CardDescription>
            </CardHeader>
            <CardContent>
              {activeShifts.length > 0 ? (
                <div className="space-y-2">
                  {activeShifts.map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{shift.title}</div>
                        <div className="text-sm text-muted-foreground">{shift.location}</div>
                      </div>
                      <CheckInDialog shift={shift} onSuccess={handleReportUpdate}>
                        <Button size="sm">Check In</Button>
                      </CheckInDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shifts available for check-in today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Check Out of Shift
              </CardTitle>
              <CardDescription>Complete your work day and submit report</CardDescription>
            </CardHeader>
            <CardContent>
              {checkedInShifts.length > 0 ? (
                <div className="space-y-2">
                  {checkedInShifts.map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{shift.title}</div>
                        <div className="text-sm text-muted-foreground">{shift.location}</div>
                      </div>
                      <CheckOutDialog shift={shift} onSuccess={handleReportUpdate}>
                        <Button size="sm" variant="outline">
                          Check Out
                        </Button>
                      </CheckOutDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active shifts to check out of</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by shift, brand, or worker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending Check-in</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No work reports found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const shift = shifts.find((s) => s.id === report.shift_id)
            const worker = workers.find((w) => w.id === report.promoter_id)

            if (!shift || !worker) return null

            const getStatusBadge = () => {
              if (report.check_in_time && report.check_out_time) {
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>
              } else if (report.check_in_time) {
                return <Badge className="bg-blue-100 text-blue-800">Checked In</Badge>
              } else {
                return <Badge variant="outline">Pending</Badge>
              }
            }

            return (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{shift.title}</h3>
                        {getStatusBadge()}
                        {report.is_late && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Late
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {worker.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {shift.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(shift.start_datetime), "MMM dd, yyyy")}
                        </div>
                      </div>

                      {report.check_in_time && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Check-in: </span>
                            {format(new Date(report.check_in_time), "HH:mm")}
                          </div>
                          {report.check_out_time && (
                            <div>
                              <span className="font-medium">Check-out: </span>
                              {format(new Date(report.check_out_time), "HH:mm")}
                            </div>
                          )}
                        </div>
                      )}

                      {report.work_summary && (
                        <div className="text-sm">
                          <span className="font-medium">Summary: </span>
                          <span className="text-muted-foreground">
                            {report.work_summary.length > 100
                              ? `${report.work_summary.substring(0, 100)}...`
                              : report.work_summary}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {report.work_photos && report.work_photos.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          {report.work_photos.length} photos
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* View Report Dialog */}
      {selectedReport && (
        <ViewReportDialog
          report={selectedReport}
          shift={shifts.find((s) => s.id === selectedReport.shift_id)!}
          worker={workers.find((w) => w.id === selectedReport.promoter_id)!}
          open={viewReportOpen}
          onOpenChange={setViewReportOpen}
        />
      )}
    </div>
  )
}
