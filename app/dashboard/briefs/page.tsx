"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Play,
  FileText,
  ClipboardCheck,
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
} from "lucide-react"
import { format } from "date-fns"
import { useSupabase } from "@/lib/supabase-provider"
import { getShifts, type Shift } from "@/lib/shifts-database"
import {
  getWorkBriefs,
  createWorkBrief,
  updateWorkBrief,
  deleteWorkBrief,
  type WorkBrief,
} from "@/lib/work-briefs-database"
import { useToast } from "@/components/ui/use-toast"
import CreateBriefDialog from "@/components/briefs/create-brief-dialog"
import EditBriefDialog from "@/components/briefs/edit-brief-dialog"
import ViewBriefDialog from "@/components/briefs/view-brief-dialog"

export default function BriefsPage() {
  const { user } = useSupabase()
  const { toast } = useToast()
  const [briefs, setBriefs] = useState<WorkBrief[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBrief, setSelectedBrief] = useState<WorkBrief | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const isManager = user?.email === "Mtsand09@gmail.com"
  const currentUserId = user?.id || ""

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [briefsData, shiftsData] = await Promise.all([getWorkBriefs(), getShifts()])
      setBriefs(briefsData)
      setShifts(shiftsData)
    } catch (error) {
      toast({
        title: "Error loading briefs",
        description: "Failed to load work briefs data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter briefs based on user role and filters
  const getFilteredBriefs = () => {
    let filteredBriefs = briefs

    // Role-based filtering
    if (!isManager) {
      // Workers only see briefs for shifts they're assigned to
      const assignedShiftIds = shifts
        .filter((shift) => shift.assigned_workers.includes(currentUserId))
        .map((shift) => shift.id)

      filteredBriefs = briefs.filter((brief) => assignedShiftIds.includes(brief.shift_id))
    }

    // Status filtering
    if (statusFilter !== "all") {
      filteredBriefs = filteredBriefs.filter((brief) => brief.status === statusFilter)
    }

    // Search filtering
    if (searchTerm) {
      filteredBriefs = filteredBriefs.filter(
        (brief) =>
          brief.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brief.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brief.shift_title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort by created date (newest first)
    return filteredBriefs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const handleCreateBrief = async (briefData: any) => {
    try {
      const newBrief = await createWorkBrief(briefData)
      setBriefs([...briefs, newBrief])
      setCreateDialogOpen(false)
      toast({
        title: "Work brief created",
        description: "New work brief has been created successfully",
      })
    } catch (error) {
      toast({
        title: "Error creating brief",
        description: "Failed to create work brief",
        variant: "destructive",
      })
    }
  }

  const handleEditBrief = async (briefData: any) => {
    try {
      const updatedBrief = await updateWorkBrief(briefData.id, briefData)
      setBriefs(briefs.map((brief) => (brief.id === updatedBrief.id ? updatedBrief : brief)))
      setEditDialogOpen(false)
      setSelectedBrief(null)
      toast({
        title: "Work brief updated",
        description: "Work brief has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error updating brief",
        description: "Failed to update work brief",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBrief = async (briefId: string) => {
    try {
      await deleteWorkBrief(briefId)
      setBriefs(briefs.filter((brief) => brief.id !== briefId))
      setEditDialogOpen(false)
      setSelectedBrief(null)
      toast({
        title: "Work brief deleted",
        description: "Work brief has been removed",
      })
    } catch (error) {
      toast({
        title: "Error deleting brief",
        description: "Failed to delete work brief",
        variant: "destructive",
      })
    }
  }

  const handleViewBrief = (brief: WorkBrief) => {
    setSelectedBrief(brief)
    setViewDialogOpen(true)
  }

  const handleEditClick = (brief: WorkBrief) => {
    setSelectedBrief(brief)
    setEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCompletionStatus = (brief: WorkBrief) => {
    // In a real app, this would check user's completion status
    const hasWatchedVideo = Math.random() > 0.5
    const hasReadBrand = Math.random() > 0.5
    const hasPassedTest = Math.random() > 0.5

    return {
      video: hasWatchedVideo,
      brand: hasReadBrand,
      test: hasPassedTest,
      overall: hasWatchedVideo && hasReadBrand && hasPassedTest,
    }
  }

  const filteredBriefs = getFilteredBriefs()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading work briefs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Briefs</h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Create and manage training materials for work shifts"
              : "Access training videos, brand information, and tests for your assigned shifts"}
          </p>
        </div>
        {isManager && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Brief
            </Button>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "Total Briefs" : "Available Briefs"}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredBriefs.length}</div>
            <p className="text-xs text-muted-foreground">{isManager ? "All work briefs" : "For your shifts"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "Published" : "Training Videos"}</CardTitle>
            {isManager ? (
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Video className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isManager
                ? filteredBriefs.filter((brief) => brief.status === "published").length
                : filteredBriefs.filter((brief) => brief.training_video_url).length}
            </div>
            <p className="text-xs text-muted-foreground">{isManager ? "Ready for workers" : "Available to watch"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "Draft" : "Brand Guides"}</CardTitle>
            {isManager ? (
              <Clock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isManager
                ? filteredBriefs.filter((brief) => brief.status === "draft").length
                : filteredBriefs.filter((brief) => brief.brand_information).length}
            </div>
            <p className="text-xs text-muted-foreground">{isManager ? "In progress" : "Available to read"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isManager ? "This Week" : "Tests"}</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isManager
                ? filteredBriefs.filter((brief) => {
                    const shift = shifts.find((s) => s.id === brief.shift_id)
                    if (!shift) return false
                    const shiftDate = new Date(shift.start_datetime)
                    const now = new Date()
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return shiftDate >= now && shiftDate <= weekFromNow
                  }).length
                : filteredBriefs.filter((brief) => brief.test_questions && brief.test_questions.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">{isManager ? "Upcoming shifts" : "Available to take"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isManager ? "All Work Briefs" : "Your Work Briefs"} ({filteredBriefs.length})
          </CardTitle>
          <CardDescription>
            {isManager
              ? "Manage training materials and tests for all work shifts"
              : "Complete training requirements for your assigned shifts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search briefs, brands, or shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Briefs List */}
          <div className="space-y-4">
            {filteredBriefs.length > 0 ? (
              filteredBriefs.map((brief) => {
                const shift = shifts.find((s) => s.id === brief.shift_id)
                const completion = !isManager ? getCompletionStatus(brief) : null

                return (
                  <div key={brief.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{brief.title}</h3>
                            <p className="text-sm text-muted-foreground">{brief.brand_name}</p>
                            {shift && (
                              <p className="text-xs text-muted-foreground">
                                {shift.title} • {format(new Date(shift.start_datetime), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(brief.status)}>{brief.status}</Badge>
                            {!isManager && completion && (
                              <Badge variant={completion.overall ? "default" : "secondary"}>
                                {completion.overall ? "Completed" : "In Progress"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Training Video */}
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-2 rounded-full ${brief.training_video_url ? "bg-blue-100" : "bg-gray-100"}`}
                            >
                              <Play
                                className={`h-4 w-4 ${brief.training_video_url ? "text-blue-600" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Training Video</div>
                              <div className="text-xs text-muted-foreground">
                                {brief.training_video_url
                                  ? !isManager && completion
                                    ? completion.video
                                      ? "Watched"
                                      : "Not watched"
                                    : "Available"
                                  : "Not uploaded"}
                              </div>
                            </div>
                            {!isManager && completion && completion.video && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>

                          {/* Brand Information */}
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-2 rounded-full ${brief.brand_information ? "bg-green-100" : "bg-gray-100"}`}
                            >
                              <BookOpen
                                className={`h-4 w-4 ${brief.brand_information ? "text-green-600" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Brand Guide</div>
                              <div className="text-xs text-muted-foreground">
                                {brief.brand_information
                                  ? !isManager && completion
                                    ? completion.brand
                                      ? "Read"
                                      : "Not read"
                                    : "Available"
                                  : "Not created"}
                              </div>
                            </div>
                            {!isManager && completion && completion.brand && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>

                          {/* Test */}
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-2 rounded-full ${brief.test_questions && brief.test_questions.length > 0 ? "bg-purple-100" : "bg-gray-100"}`}
                            >
                              <ClipboardCheck
                                className={`h-4 w-4 ${brief.test_questions && brief.test_questions.length > 0 ? "text-purple-600" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Knowledge Test</div>
                              <div className="text-xs text-muted-foreground">
                                {brief.test_questions && brief.test_questions.length > 0
                                  ? !isManager && completion
                                    ? completion.test
                                      ? "Passed"
                                      : "Not taken"
                                    : `${brief.test_questions.length} questions`
                                  : "Not created"}
                              </div>
                            </div>
                            {!isManager && completion && completion.test && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            Created {format(new Date(brief.created_at), "MMM d, yyyy")}
                            {brief.updated_at !== brief.created_at && (
                              <span> • Updated {format(new Date(brief.updated_at), "MMM d, yyyy")}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewBrief(brief)}>
                              <Eye className="h-3 w-3 mr-1" />
                              {isManager ? "View" : "Start Training"}
                            </Button>
                            {isManager && (
                              <Button variant="outline" size="sm" onClick={() => handleEditClick(brief)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No work briefs found</h3>
                <p className="text-muted-foreground">
                  {isManager
                    ? "Create your first work brief to provide training materials for workers."
                    : "No training materials available for your assigned shifts yet."}
                </p>
                {isManager && (
                  <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Brief
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Brief Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CreateBriefDialog
            shifts={shifts}
            onCreateBrief={handleCreateBrief}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Brief Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBrief && (
            <EditBriefDialog
              brief={selectedBrief}
              shifts={shifts}
              onEditBrief={handleEditBrief}
              onDeleteBrief={handleDeleteBrief}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedBrief(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Brief Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBrief && (
            <ViewBriefDialog
              brief={selectedBrief}
              shift={shifts.find((s) => s.id === selectedBrief.shift_id)}
              isManager={isManager}
              onClose={() => {
                setViewDialogOpen(false)
                setSelectedBrief(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
