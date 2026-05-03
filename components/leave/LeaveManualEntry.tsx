"use client"

import { Info } from "lucide-react"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { LeaveType } from "@/types/leave"

interface Props {
  leaveTypes: LeaveType[]
}

export default function LeaveManualEntry({ leaveTypes }: Props) {
  return (
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
    </div>
  )
}