"use client"

import React from "react"
import { JobLevel } from "@prisma/client"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FormInput } from "@/components/data-table/form-elements"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: JobLevel | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function JobLevelControls({ open, onOpenChange, editingData, onSubmit, isPending }: Props) {
  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Job Level" : "Add Job Level"}
      description={editingData ? "Adjust level naming and grading status" : "Set career stages and seniority ranks"}
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Level" : "Save Level"}
    >
      <div className="space-y-4">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        <FormInput
          label="Level Name"
          name="levelName"
          defaultValue={editingData?.levelName || ""}
          placeholder="e.g. Senior Associate"
          required
        />
      </div>
    </EntryDialog>
  )
}