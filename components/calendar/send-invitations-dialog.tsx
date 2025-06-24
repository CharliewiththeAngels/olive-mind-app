"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, Users } from "lucide-react"
import type { Worker } from "@/lib/database"
import type { Shift } from "@/lib/shifts-database"
import { createInvitation } from "@/lib/invitations-database"
import { updateShift } from "@/lib/shifts-database"
import InvitationMessagePreview from "./invitation-message-preview"

interface SendInvitationsDialogProps {
  shift: Shift
  workers: Worker[]
  onInvitationsSent: (updatedShift: Shift) => void
  onCancel: () => void
}

export default function SendInvitationsDialog({
  shift,
  workers,
  onInvitationsSent,
  onCancel,
}: SendInvitationsDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [previewWorker, setPreviewWorker] = useState<Worker | null>(null)

  const handleWorkerToggle = (workerId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkers([...selectedWorkers, workerId])
    } else {
      setSelectedWorkers(selectedWorkers.filter((id) => id !== workerId))
    }
  }

  const handleSendInvitations = async () => {
    if (selectedWorkers.length === 0) {
      toast({
        title: "No workers selected",
        description: "Please select at least one worker to invite",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create invitations for each selected worker
      const invitationPromises = selectedWorkers.map((workerId) =>
        createInvitation({
          shift_id: shift.id,
          promoter_id: workerId,
          status: "pending",
        }),
      )

      await Promise.all(invitationPromises)

      // Update shift with invited workers
      const updatedShift = await updateShift(shift.id, {
        invited_workers: [...shift.invited_workers, ...selectedWorkers],
      })

      toast({
        title: "Invitations sent",
        description: `${selectedWorkers.length} workers have been invited to this shift`,
      })

      onInvitationsSent(updatedShift)
    } catch (error) {
      toast({
        title: "Error sending invitations",
        description: "Failed to send invitations to workers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const availableWorkers = workers.filter(
    (worker) => !shift.invited_workers.includes(worker.id) && !shift.assigned_workers.includes(worker.id),
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Send Work Invitations</span>
          <Badge variant="outline">{shift.title}</Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Shift Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Shift Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              <strong>Required Workers:</strong> {shift.required_workers}
            </div>
            <div>
              <strong>Currently Assigned:</strong> {shift.assigned_workers.length}
            </div>
            <div>
              <strong>Previously Invited:</strong> {shift.invited_workers.length}
            </div>
            <div>
              <strong>Available to Invite:</strong> {availableWorkers.length}
            </div>
          </div>
        </div>

        {/* Worker Selection */}
        <div className="space-y-4">
          <Label>Select Workers to Invite</Label>
          {availableWorkers.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
              {availableWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`worker-${worker.id}`}
                      checked={selectedWorkers.includes(worker.id)}
                      onCheckedChange={(checked) => handleWorkerToggle(worker.id, checked as boolean)}
                    />
                    <Label htmlFor={`worker-${worker.id}`} className="text-sm font-normal cursor-pointer">
                      {worker.full_name} - {worker.area}
                    </Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPreviewWorker(worker)}>
                    Preview
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workers available to invite</p>
              <p className="text-sm">All workers have already been invited or assigned to this shift</p>
            </div>
          )}

          {availableWorkers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedWorkers.length} workers • {availableWorkers.length} available
            </p>
          )}
        </div>

        {/* Message Preview */}
        {previewWorker && <InvitationMessagePreview shift={shift} workerName={previewWorker.full_name} />}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitations}
            disabled={loading || selectedWorkers.length === 0 || availableWorkers.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Invitations ({selectedWorkers.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
