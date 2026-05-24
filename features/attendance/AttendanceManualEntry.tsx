"use client"

import { Info } from "lucide-react"
import { FormInput, FormTimePicker } from "@/components/data-table/form-elements"
import { SubmitButton } from "@/components/data-table/submit-button"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { useCrudHandler } from "@/hooks/use-crud-handler"
import { createManualAttendance } from "@/actions/attendance-actions"

interface AttendanceManualEntryProps {
  onSuccess: () => void
}

export default function AttendanceManualEntry({ onSuccess }: AttendanceManualEntryProps) {
  const {
    isPending,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    handleAction,
  } = useCrudHandler()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    handleAction(
      createManualAttendance(formData),
      "Attendance record created successfully",
      onSuccess
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-5 text-left font-poppins w-full">
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              <strong>System note:</strong> Status (Late / Present) and overtime
              are calculated automatically based on the employee&apos;s registered
              shift schedule.
            </p>
          </div>

          <FormInput
            label="Employee ID (NIK)"
            name="nik"
            placeholder="e.g. NEX-26-001"
            required
          />

          <FormInput
            label="Attendance Date"
            name="date"
            type="date"
            required
          />

          <div className="grid grid-cols-2 gap-5">
            <FormTimePicker
              label="Check In Time"
              name="checkIn"
              defaultValue="09:00"
            />
            <FormTimePicker
              label="Check Out Time"
              name="checkOut"
              defaultValue="18:00"
            />
          </div>

          <FormInput
            label="Notes / Reason"
            name="notes"
            placeholder="e.g. Forgot to tap in"
          />

          <SubmitButton
            type="submit"
            loading={isPending}
            label="Save Attendance"
            loadingLabel="Saving..."
            className="w-full h-11 rounded-xl text-[13px] font-bold shadow-sm mt-2"
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