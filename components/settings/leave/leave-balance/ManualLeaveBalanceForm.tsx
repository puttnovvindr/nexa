"use client"

import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { ManualLeaveBalanceFormProps } from "@/types/leave"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { cn } from "@/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR - 1 + i
  return { label: String(y), value: String(y) }
})

export default function ManualLeaveBalanceForm({
  allEmployees,
  leaveTypes,
  editingData,
  loading,
}: ManualLeaveBalanceFormProps) {
  const employeeOptions = useMemo(
    () =>
      allEmployees.map((e) => ({
        label: `${e.fullName} (${e.employeeId})`,
        value: e.id,
      })),
    [allEmployees]
  )

  const leaveTypeOptions = useMemo(
    () => leaveTypes.map((t) => ({ label: t.name, value: t.id })),
    [leaveTypes]
  )

  const defaultYear = editingData
    ? String(editingData.year)
    : String(CURRENT_YEAR)

  const defaultValidFrom = editingData?.validFrom
    ? new Date(editingData.validFrom).toISOString().split("T")[0]
    : `${CURRENT_YEAR}-01-01`

  const defaultValidTo = editingData?.validTo
    ? new Date(editingData.validTo).toISOString().split("T")[0]
    : `${CURRENT_YEAR}-12-31`

  return (
    <div className="space-y-4">
      {editingData && (
        <input type="hidden" name="id" value={editingData.id} />
      )}

      <FormSelect
        label="Employee"
        name="employeeId"
        placeholder="Select employee"
        options={employeeOptions}
        defaultValue={editingData?.employeeId ?? ""}
        required
        
      />

      <FormSelect
        label="Leave Type"
        name="leaveTypeId"
        placeholder="Select leave type"
        options={leaveTypeOptions}
        defaultValue={editingData?.leaveTypeId ?? ""}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Entitlement (days)"
          name="entitlement"
          type="number"
          placeholder="12"
          defaultValue={String(editingData?.entitlement ?? 12)}
          required
        />
        <FormSelect
          label="Year"
          name="year"
          placeholder="Select year"
          options={YEAR_OPTIONS}
          defaultValue={defaultYear}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Valid From"
          name="validFrom"
          type="date"
          defaultValue={defaultValidFrom}
          required
        />
        <FormInput
          label="Valid To"
          name="validTo"
          type="date"
          defaultValue={defaultValidTo}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-11 rounded-xl text-[13px] font-bold transition-colors mt-2",
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
        ) : editingData ? (
          "Update Balance"
        ) : (
          "Save Balance"
        )}
      </button>
    </div>
  )
}