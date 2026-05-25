"use client"

import React from "react"
import { Info } from "lucide-react"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { SubmitButton } from "@/components/data-table/submit-button"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { useCrudHandler } from "@/hooks/use-crud-handler"
import { createLeave } from "@/actions/leave-actions"
import { LeaveType } from "@/types/leave"

interface LeaveManualEntryProps {
  leaveTypes: LeaveType[]
  onSuccess: () => void
}

export default function LeaveManualEntry({ leaveTypes, onSuccess }: LeaveManualEntryProps) {
  const {
    isPending: loading,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    handleAction,
  } = useCrudHandler()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const rawData = {
      employeeId: formData.get("employeeId") as string,
      leaveTypeId: formData.get("leaveTypeId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      reason: (formData.get("reason") as string) ?? undefined,
    }

    handleAction(
      createLeave(rawData),
      "Leave request has been successfully submitted.",
      onSuccess
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-5 text-left font-poppins w-full">
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <Info className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              <strong>System Note:</strong> Pastikan durasi cuti tidak melebihi sisa kuota tahunan.
              Cuti yang bentrok dengan jadwal shift akan divalidasi.
            </p>
          </div>

          <FormInput
            label="Employee ID (NIK)"
            name="employeeId"
            placeholder="Contoh: 2026001"
            required
          />

          <FormSelect
            label="Leave Type"
            name="leaveTypeId"
            placeholder="Select leave type"
            options={leaveTypes.map((t) => ({
              label: `${t.name} (${t.defaultQuota} Days)`,
              value: t.id,
            }))}
            required
          />

          <div className="grid grid-cols-2 gap-5">
            <FormInput
              label="Start Date"
              name="startDate"
              type="date"
              required
            />
            <FormInput
              label="End Date"
              name="endDate"
              type="date"
              required
            />
          </div>

          <FormInput
            label="Notes"
            name="reason"
            placeholder="Contoh: Acara keluarga"
          />

          <SubmitButton
            type="submit"
            loading={loading}
            label="Save Leave"
            loadingLabel="Saving..."
            className="w-full h-11 rounded-xl text-[13px] font-bold shadow-sm mt-2 cursor-pointer"
          />
        </div>
      </form>

      <StatusDialog
        open={statusOpen}
        success={statusSuccess}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
    </>
  )
}