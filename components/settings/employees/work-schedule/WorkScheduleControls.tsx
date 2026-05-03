"use client"

import React from "react"
import { WorkSchedule } from "@prisma/client"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FormInput, FormTimePicker } from "@/components/data-table/form-elements"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: WorkSchedule | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function WorkScheduleControls({ open, onOpenChange, editingData, onSubmit, isPending }: Props) {
  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Work Schedule" : "Add Work Schedule"}
      description="Define the working hours and late tolerance for this shift."
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Schedule" : "Save Schedule"}
    >
      <div className="space-y-4">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        
        <FormInput
          label="Shift Name"
          name="shiftName"
          defaultValue={editingData?.shiftName || ""}
          placeholder="e.g. Regular Shift"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormTimePicker
            label="Check In"
            name="checkInTime"
            defaultValue={editingData?.checkInTime || "08:00"}
          />
          <FormTimePicker
            label="Check Out"
            name="checkOutTime"
            defaultValue={editingData?.checkOutTime || "17:00"}
          />
        </div>

        <FormInput
          label="Grace Period (Minutes)"
          name="gracePeriod"
          type="number"
          defaultValue={editingData?.gracePeriod ?? 0}
          placeholder="e.g. 15"
          required
        />
      </div>
    </EntryDialog>
  )
}