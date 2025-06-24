"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import CreateShiftDialog from "@/components/calendar/create-shift-dialog"
import EditShiftDialog from "@/components/calendar/edit-shift-dialog"
import { getAllWorkers, type Worker } from "@/lib/database"
import { getShifts, createShift, updateShift, deleteShift, type Shift } from "@/lib/shifts-database"
import { useToast } from "@/components/ui/use-toast"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [workersData, shiftsData] = await Promise.all([getAllWorkers(), getShifts()])
      setWorkers(workersData)
      setShifts(shiftsData)
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load calendar data",
        variant: "destructive",
      })
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getShiftsForDay = (day: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.start_datetime)
      return isSameDay(shiftDate, day)
    })
  }

  const handleCreateShift = async (shiftData: any) => {
    try {
      const newShift = await createShift(shiftData)
      setShifts([...shifts, newShift])
      setCreateDialogOpen(false)
      toast({
        title: "Shift created",
        description: "New shift has been added to the calendar",
      })
    } catch (error) {
      toast({
        title: "Error creating shift",
        description: "Failed to create shift",
        variant: "destructive",
      })
    }
  }

  const handleEditShift = async (shiftData: any) => {
    try {
      const updatedShift = await updateShift(shiftData.id, shiftData)
      setShifts(shifts.map((shift) => (shift.id === updatedShift.id ? updatedShift : shift)))
      setEditDialogOpen(false)
      setSelectedShift(null)
      toast({
        title: "Shift updated",
        description: "Shift has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error updating shift",
        description: "Failed to update shift",
        variant: "destructive",
      })
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShift(shiftId)
      setShifts(shifts.filter((shift) => shift.id !== shiftId))
      setEditDialogOpen(false)
      setSelectedShift(null)
      toast({
        title: "Shift deleted",
        description: "Shift has been removed from the calendar",
      })
    } catch (error) {
      toast({
        title: "Error deleting shift",
        description: "Failed to delete shift",
        variant: "destructive",
      })
    }
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setCreateDialogOpen(true)
  }

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift)
    setEditDialogOpen(true)
  }

  const getShiftColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-400"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage work shifts</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateShiftDialog
              workers={workers}
              selectedDate={selectedDate}
              onCreateShift={handleCreateShift}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Published</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Draft</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const dayShifts = getShiftsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={index}
                  className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? "text-gray-400" : ""
                  } ${isToday ? "bg-blue-50" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>{format(day, "d")}</div>

                  {/* Shifts for this day */}
                  <div className="space-y-1">
                    {dayShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        className={`text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 ${getShiftColor(shift.status)}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShiftClick(shift)
                        }}
                      >
                        <div className="font-medium truncate">{shift.title}</div>
                        <div className="truncate">
                          {format(new Date(shift.start_datetime), "HH:mm")} -{" "}
                          {format(new Date(shift.end_datetime), "HH:mm")}
                        </div>
                        <div className="truncate">{shift.brand_name}</div>
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className="text-xs text-gray-500 p-1">+{dayShifts.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mini Calendar and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Total Shifts</span>
              <Badge variant="outline">{shifts.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">This Month</span>
              <Badge variant="outline">
                {
                  shifts.filter((shift) => {
                    const shiftDate = new Date(shift.start_datetime)
                    return isSameMonth(shiftDate, currentDate)
                  }).length
                }
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Published</span>
              <Badge variant="default">{shifts.filter((shift) => shift.status === "published").length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Draft</span>
              <Badge variant="secondary">{shifts.filter((shift) => shift.status === "draft").length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shifts
                .filter((shift) => new Date(shift.start_datetime) >= new Date())
                .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                .slice(0, 5)
                .map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleShiftClick(shift)}
                  >
                    <div>
                      <div className="font-medium">{shift.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(shift.start_datetime), "MMM d, yyyy • HH:mm")} -{" "}
                        {format(new Date(shift.end_datetime), "HH:mm")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {shift.brand_name} • {shift.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={shift.status === "published" ? "default" : "secondary"}>{shift.status}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">R{shift.hourly_rate}/hour</div>
                    </div>
                  </div>
                ))}
              {shifts.filter((shift) => new Date(shift.start_datetime) >= new Date()).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No upcoming shifts scheduled</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Shift Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedShift && (
            <EditShiftDialog
              shift={selectedShift}
              workers={workers}
              onEditShift={handleEditShift}
              onDeleteShift={handleDeleteShift}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedShift(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
