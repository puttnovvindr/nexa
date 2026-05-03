"use client"

import React from "react"
import { EmploymentType } from "@prisma/client"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FormInput } from "@/components/data-table/form-elements"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: EmploymentType | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function EmploymentTypeControls({ open, onOpenChange, editingData, onSubmit, isPending }: Props) {
  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Employment Type" : "Add Employment Type"}
      description={editingData ? "Update terms for specific employee types" : "Create contract types and work status"}
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Type" : "Save Type"}
    >
      <div className="space-y-4">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        <FormInput
          label="Type Name"
          name="name"
          defaultValue={editingData?.name || ""}
          placeholder="e.g. Permanent, Internship"
          required
        />
      </div>
    </EntryDialog>
  )
}