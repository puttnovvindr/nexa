"use client"

import { updateLeaveStatus } from "@/actions/leave-actions"
import { Button } from "@/components/ui/button"
import { LeaveStatus } from "@/types/leave"

export default function LeaveAction({
  id,
  status
}: {
  id: string
  status: LeaveStatus
}) {
  if (status !== "PENDING") return null

  const handle = async (s: "APPROVED" | "REJECTED") => {
    await updateLeaveStatus({ id, status: s })
    location.reload()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handle("APPROVED")}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handle("REJECTED")}>
        Reject
      </Button>
    </div>
  )
}