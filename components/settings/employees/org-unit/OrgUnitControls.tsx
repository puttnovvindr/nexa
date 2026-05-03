"use client"

import React from "react"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { OrgUnitWithParent } from "@/types/settings"

type SafeOrgUnit = OrgUnitWithParent & { [key: string]: unknown }

interface OrgUnitControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: SafeOrgUnit | null
  units: SafeOrgUnit[]
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function OrgUnitControls({
  open,
  onOpenChange,
  editingData,
  units,
  onSubmit,
  isPending,
}: OrgUnitControlsProps) {
  const unitOptions = [
    { label: "Parent Unit", value: "root" },
    ...units.map((u) => ({
      label: u.name,
      value: u.id,
    }))
  ]

  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Org Unit" : "Add Org Unit"}
      description="Define and manage your organizational structure"
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Unit" : "Save Unit"}
    >
      <div className="space-y-4">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        
        <FormInput
          label="Unit Name"
          name="name"
          defaultValue={editingData?.name || ""}
          placeholder="e.g. Technology Division"
          required
        />
        
        <FormSelect
          label="Parent Unit"
          name="parentId"
          defaultValue={editingData?.parentId || "root"}
          options={unitOptions}
          placeholder="Select parent unit"
          required
        />
      </div>
    </EntryDialog>
  )
}