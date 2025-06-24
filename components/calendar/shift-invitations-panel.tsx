"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Send, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import type { Shift } from "@/lib/shifts-database"
import type { Worker } from "@/lib/database"
import {
  getInvitationsByShift,
  respondToInvitation,
  expireInvitations,
  type ShiftInvitation,
} from "@/lib/invitations-database"
import { assignWorkerToShift } from "@/lib/shifts-database"
import SendInvitationsDialog from "./send-invitations-dialog"
import { useToast } from "@/components/ui/use-toast"

interface ShiftInvitationsPanelProps {
  shift: Shift
  workers: Worker[]
  onShiftUpdate: (updatedShift: Shift) => void
}

export default function ShiftInvitationsPanel({ shift, workers, onShiftUpdate }: ShiftInvitationsPanelProps) {
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<ShiftInvitation[]>([])
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInvitations()
  }, [shift.id])

  const loadInvitations = async () => {
    try {
      const invitationsData = await getInvitationsByShift(shift.id)
      setInvitations(invitationsData)
    } catch (error) {
      console.error("Failed to load invitations:", error)
    }
  }

  const handleInvitationResponse = async (invitationId: string, status: "accepted" | "declined") => {
    setLoading(true)
    try {
      // Update invitation status
      await respondToInvitation(invitationId, status)

      if (status === "accepted") {
        const invitation = invitations.find((inv) => inv.id === invitationId)
        if (invitation) {
          // Check if shift still has space
          if (shift.assigned_workers.length < shift.required_workers) {
            // Assign worker to shift
            const updatedShift = await assignWorkerToShift(shift.id, invitation.promoter_id)

            // If shift is now full, expire remaining pending invitations
            if (updatedShift.assigned_workers.length >= updatedShift.required_workers) {
              const acceptedInvitations = invitations.filter((inv) => inv.status === "accepted").map((inv) => inv.id)
              acceptedInvitations.push(invitationId)

              await expireInvitations(shift.id, acceptedInvitations)

              toast({
                title: "Shift is now full",
                description: "All remaining invitations have been expired",
              })
            }

            onShiftUpdate(updatedShift)
          } else {
            // Shift is already full, expire this invitation
            await respondToInvitation(invitationId, "expired")
            toast({
              title: "Work expired",
              description: "This shift is already full",
              variant: "destructive",
            })
          }
        }
      }

      await loadInvitations()
    } catch (error) {
      toast({
        title: "Error processing response",
        description: "Failed to process invitation response",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getWorkerById = (workerId: string) => {
    return workers.find((w) => w.id === workerId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "expired":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Worker Invitations</CardTitle>
            <Button onClick={() => setSendDialogOpen(true)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{shift.assigned_workers.length}</div>
                <div className="text-sm text-muted-foreground">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {invitations.filter((inv) => inv.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {invitations.filter((inv) => inv.status === "accepted").length}
                </div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {invitations.filter((inv) => inv.status === "declined").length}
                </div>
                <div className="text-sm text-muted-foreground">Declined</div>
              </div>
            </div>

            {/* Invitations List */}
            {invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => {
                  const worker = getWorkerById(invitation.promoter_id)
                  if (!worker) return null

                  return (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                          <div className="text-sm text-muted-foreground">{worker.area}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Invited: {format(new Date(invitation.invited_at), "MMM d, HH:mm")}
                          </div>
                          {invitation.responded_at && (
                            <div className="text-sm text-muted-foreground">
                              Responded: {format(new Date(invitation.responded_at), "MMM d, HH:mm")}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusIcon(invitation.status)}
                          <Badge className={getStatusColor(invitation.status)}>{invitation.status}</Badge>
                        </div>

                        {/* Demo buttons for testing */}
                        {invitation.status === "pending" && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationResponse(invitation.id, "accepted")}
                              disabled={loading}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationResponse(invitation.id, "declined")}
                              disabled={loading}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invitations sent yet</p>
                <p className="text-sm">Click "Send Invitations" to invite workers to this shift</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Invitations Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <SendInvitationsDialog
            shift={shift}
            workers={workers}
            onInvitationsSent={(updatedShift) => {
              setSendDialogOpen(false)
              onShiftUpdate(updatedShift)
              loadInvitations()
            }}
            onCancel={() => setSendDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
