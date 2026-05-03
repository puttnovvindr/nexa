"use client"

import React from "react"
import { Job, OrganizationUnit } from "@prisma/client"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"

type JobWithOrg = Job & { orgUnit: OrganizationUnit }

interface JobTitleControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: JobWithOrg | null
  orgUnits: OrganizationUnit[]
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function JobTitleControls({
  open,
  onOpenChange,
  editingData,
  orgUnits,
  onSubmit,
  isPending,
}: JobTitleControlsProps) {
  const unitOptions = orgUnits.map((u) => ({
    label: u.name,
    value: u.id,
  }))

  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Job Title" : "Add Job Title"}
      description="Define role designations and departmental alignment"
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Position" : "Save Position"}
    >
      <div className="space-y-4">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        
        <FormInput
          label="Position Name"
          name="jobTitle"
          defaultValue={editingData?.jobTitle || ""}
          placeholder="e.g. Senior Software Engineer"
          required
        />
        
        <FormSelect
          label="Organization Unit"
          name="orgUnitId"
          defaultValue={editingData?.orgUnitId || ""}
          options={unitOptions}
          placeholder="Select department/unit"
          required
        />
      </div>
    </EntryDialog>
  )
}