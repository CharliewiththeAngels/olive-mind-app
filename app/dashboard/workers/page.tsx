"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Star, Loader2, Camera, Images } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import AddWorkerDialog from "@/components/workers/add-worker-dialog"
import EditWorkerDialog from "@/components/workers/edit-worker-dialog"
import ViewWorkerDialog from "@/components/workers/view-worker-dialog"
import PhotoGalleryDialog from "@/components/workers/photo-gallery-dialog"
import { getAllWorkers, addWorker, updateWorker, deleteWorker, type Worker } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { getUserRole, canEdit } from "@/lib/supabase-server"

export default function WorkersPage() {
  const { user } = useSupabase()
  const userRole = getUserRole(user?.email)
  const canEditWorkers = canEdit(userRole)

  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false)
  const { toast } = useToast()

  // Load workers on component mount
  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      setLoading(true)
      const workersData = await getAllWorkers()
      setWorkers(workersData)
    } catch (error) {
      toast({
        title: "Error loading workers",
        description: "Failed to load worker data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone.includes(searchTerm) ||
      worker.area.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddWorker = async (newWorkerData: any) => {
    if (!canEditWorkers) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add workers",
        variant: "destructive",
      })
      return
    }

    try {
      const newWorker = await addWorker(newWorkerData)
      setWorkers([...workers, newWorker])
      setDialogOpen(false)
      toast({
        title: "Worker added successfully",
        description: `${newWorkerData.full_name} has been added to the database.`,
      })
    } catch (error) {
      toast({
        title: "Error adding worker",
        description: "Failed to add worker to database",
        variant: "destructive",
      })
    }
  }

  const handleEditWorker = async (updatedWorker: Worker) => {
    if (!canEditWorkers) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit workers",
        variant: "destructive",
      })
      return
    }

    try {
      const updated = await updateWorker(updatedWorker.id, updatedWorker)
      setWorkers(workers.map((worker) => (worker.id === updated.id ? updated : worker)))
      setEditDialogOpen(false)
      setSelectedWorker(null)
      toast({
        title: "Worker updated successfully",
        description: `${updatedWorker.full_name}'s information has been updated.`,
      })
    } catch (error) {
      toast({
        title: "Error updating worker",
        description: "Failed to update worker information",
        variant: "destructive",
      })
    }
  }

  const handleDeleteWorker = async (workerId: string) => {
    if (!canEditWorkers) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete workers",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteWorker(workerId)
      setWorkers(workers.filter((worker) => worker.id !== workerId))
      toast({
        title: "Worker deleted",
        description: "Worker has been removed from the database.",
      })
    } catch (error) {
      toast({
        title: "Error deleting worker",
        description: "Failed to delete worker",
        variant: "destructive",
      })
    }
  }

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker)
    setViewDialogOpen(true)
  }

  const handleEditClick = (worker: Worker) => {
    if (!canEditWorkers) {
      toast({
        title: "Read-Only Access",
        description: "You can only view worker information",
        variant: "destructive",
      })
      return
    }
    setSelectedWorker(worker)
    setEditDialogOpen(true)
  }

  const handleViewPhotos = (worker: Worker) => {
    setSelectedWorker(worker)
    setPhotoGalleryOpen(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading workers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Database</h1>
          <p className="text-muted-foreground">
            {canEditWorkers
              ? "Manage your workforce and track performance"
              : "View workforce information and performance"}
          </p>
          {userRole === "promoter_manager" && (
            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
              Read-Only Access
            </Badge>
          )}
        </div>
        {canEditWorkers && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AddWorkerDialog onAddWorker={handleAddWorker} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground">
              {workers.filter((w) => w.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workers.length > 0 ? (workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1) : "0"}
            </div>
            <div className="flex items-center space-x-1">
              {workers.length > 0 &&
                renderStars(Math.round(workers.reduce((sum, w) => sum + w.rating, 0) / workers.length))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workers.reduce((sum, w) => sum + (w.profile_pictures?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Owing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{workers.reduce((sum, w) => sum + w.amount_owing, 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Workers ({workers.length})</CardTitle>
          <CardDescription>
            {canEditWorkers
              ? "Complete database of all workers with detailed information and photo galleries"
              : "View worker database with detailed information and photo galleries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Sizes</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Owing</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={worker.profile_pictures?.[0] || "/placeholder.svg"}
                            alt={worker.full_name}
                          />
                          <AvatarFallback>
                            {worker.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.full_name}</div>
                          <div className="text-sm text-muted-foreground">ID: {worker.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{worker.phone}</div>
                        <div className="text-xs text-muted-foreground">WA: {worker.whatsapp_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{worker.area}</Badge>
                    </TableCell>
                    <TableCell>{worker.age}</TableCell>
                    <TableCell>{worker.height}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>D: {worker.dress_size}</div>
                        <div>T: {worker.top_size}</div>
                        <div>S: {worker.shoe_size}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {worker.instagram_handle && <div className="text-pink-600">@{worker.instagram_handle}</div>}
                        {worker.tiktok_handle && <div className="text-black">@{worker.tiktok_handle}</div>}
                        {!worker.instagram_handle && !worker.tiktok_handle && (
                          <div className="text-muted-foreground">N/A</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(worker.rating)}
                        <span className="text-sm ml-1">{worker.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPhotos(worker)}
                        className="flex items-center space-x-1"
                      >
                        <Images className="h-3 w-3" />
                        <span>{worker.profile_pictures?.length || 0}</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={worker.work_contract_signed ? "default" : "destructive"}>
                        {worker.work_contract_signed ? "Signed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={worker.amount_owing > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        R{worker.amount_owing.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewWorker(worker)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewPhotos(worker)}>
                            <Camera className="mr-2 h-4 w-4" />
                            View Photos ({worker.profile_pictures?.length || 0})
                          </DropdownMenuItem>
                          {canEditWorkers && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditClick(worker)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Worker
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteWorker(worker.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Worker
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Worker Dialog */}
      {canEditWorkers && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedWorker && (
              <EditWorkerDialog
                worker={selectedWorker}
                onEditWorker={handleEditWorker}
                onCancel={() => {
                  setEditDialogOpen(false)
                  setSelectedWorker(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* View Worker Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedWorker && (
            <ViewWorkerDialog
              worker={selectedWorker}
              onClose={() => {
                setViewDialogOpen(false)
                setSelectedWorker(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={photoGalleryOpen} onOpenChange={setPhotoGalleryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedWorker && (
            <PhotoGalleryDialog
              worker={selectedWorker}
              onClose={() => {
                setPhotoGalleryOpen(false)
                setSelectedWorker(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
