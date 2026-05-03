"use client"

import { Info, Loader2 } from "lucide-react"
import { FormInput, FormTimePicker } from "@/components/data-table/form-elements"
import { cn } from "@/lib/utils"
import { AttendanceManualEntryProps } from "@/types/attendance"

export default function AttendanceManualEntry({ loading }: AttendanceManualEntryProps) {
  return (
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

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-11 rounded-xl text-[13px] font-bold transition-colors",
          "bg-violet-600 text-white hover:bg-violet-700",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save Attendance"
        )}
      </button>
    </div>
  )
}