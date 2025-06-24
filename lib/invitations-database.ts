"use client"

export interface ShiftInvitation {
  id: string
  shift_id: string
  promoter_id: string
  status: "pending" | "accepted" | "declined" | "expired"
  invited_at: string
  responded_at: string | null
  message_sent: boolean
}

// Mock invitations data
const mockInvitations: ShiftInvitation[] = []

export const getInvitations = async (): Promise<ShiftInvitation[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockInvitations
}

export const getInvitationsByShift = async (shiftId: string): Promise<ShiftInvitation[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockInvitations.filter((inv) => inv.shift_id === shiftId)
}

export const getInvitationsByWorker = async (workerId: string): Promise<ShiftInvitation[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockInvitations.filter((inv) => inv.promoter_id === workerId)
}

export const createInvitation = async (
  invitationData: Omit<ShiftInvitation, "id" | "invited_at" | "responded_at" | "message_sent">,
): Promise<ShiftInvitation> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newInvitation: ShiftInvitation = {
    ...invitationData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    invited_at: new Date().toISOString(),
    responded_at: null,
    message_sent: true,
  }

  mockInvitations.push(newInvitation)
  return newInvitation
}

export const respondToInvitation = async (
  invitationId: string,
  status: "accepted" | "declined",
): Promise<ShiftInvitation> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const invitationIndex = mockInvitations.findIndex((inv) => inv.id === invitationId)
  if (invitationIndex === -1) {
    throw new Error("Invitation not found")
  }

  const updatedInvitation = {
    ...mockInvitations[invitationIndex],
    status,
    responded_at: new Date().toISOString(),
  }

  mockInvitations[invitationIndex] = updatedInvitation
  return updatedInvitation
}

export const expireInvitations = async (shiftId: string, excludeInvitationIds: string[]): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  mockInvitations.forEach((invitation) => {
    if (
      invitation.shift_id === shiftId &&
      invitation.status === "pending" &&
      !excludeInvitationIds.includes(invitation.id)
    ) {
      invitation.status = "expired"
      invitation.responded_at = new Date().toISOString()
    }
  })
}
