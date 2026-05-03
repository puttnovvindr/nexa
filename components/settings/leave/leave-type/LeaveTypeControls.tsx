"use client"

import React from "react"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { cn } from "@/lib/utils"
import { LeaveType } from "@/types/leave"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: LeaveType | null
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const CATEGORY_OPTIONS = [
  { label: "Paid Leave (Cuti Berbayar)", value: "PAID" },
  { label: "Unpaid Leave (Cuti Diluar Tanggungan)", value: "UNPAID" },
  { label: "Sick Leave (Izin Sakit)", value: "SICK" },
]

const DURATION_OPTIONS = [
  { label: "Full Day", value: "FULL" },
  { label: "Half Day Allowed", value: "HALF" },
  { label: "Hourly", value: "HOURLY" },
]

export function LeaveTypeControls({
  open,
  onOpenChange,
  editingData,
  isPending,
  onSubmit,
}: Props) {
  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingData ? "Edit Leave Type" : "Add Leave Type"}
      description="Define leave categories and global policies"
      onSubmit={onSubmit}
      isPending={isPending}
      confirmText={editingData ? "Update Type" : "Save Leave Type"}
      showFooter={true}
      className="max-w-lg font-poppins"
    >
      <div className="space-y-6 w-full font-poppins">
        {editingData && <input type="hidden" name="id" value={editingData.id} />}
        
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <FormInput
              label="Leave Name"
              name="name"
              placeholder="e.g. Cuti Tahunan, Maternity Leave"
              defaultValue={editingData?.name}
              required
            />
          </div>

          <FormSelect
            label="Category"
            name="category"
            placeholder="Select category..."
            defaultValue={editingData?.category}
            options={CATEGORY_OPTIONS}
            required
          />

          <FormInput
            label="Default Annual Quota"
            name="defaultQuota"
            type="number"
            placeholder="e.g. 12"
            defaultValue={editingData?.defaultQuota?.toString() ?? "0"}
            required
          />

          <FormSelect
            label="Duration Type"
            name="durationType"
            placeholder="Select duration type"
            defaultValue={editingData?.durationType || "FULL"}
            options={DURATION_OPTIONS}
            required
          />

          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPaid" 
                name="isPaid" 
                defaultChecked={editingData ? editingData.isPaid : true} 
              />
              <Label htmlFor="isPaid" className="text-[12px] font-medium text-slate-700 cursor-pointer">
                Is Paid Leave (Salary is not deducted)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requiresAttachment" 
                name="requiresAttachment" 
                defaultChecked={editingData ? editingData.requiresAttachment : false} 
              />
              <Label htmlFor="requiresAttachment" className="text-[12px] font-medium text-slate-700 cursor-pointer">
                Requires Attachment (Proof/Certificate needed)
              </Label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            <span className="font-bold text-[#1E293B] block mb-1">Configuration Note:</span>
            Master data for leave types defines global policies. These settings will affect how employees apply for leave and how their balance is deducted.
          </p>
        </div>
      </div>
    </EntryDialog>
  )
}