"use client"

import React from "react"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { Info } from "lucide-react"
import { CalculationBase } from "@prisma/client"
import { SerializedComponentMaster } from "@/types/payroll"

export const BASE_LABELS: Record<CalculationBase, string> = {
  FIXED: "Fixed Amount",
  PERCENT_BASE: "% of Base Salary",
  PERCENT_GROSS: " % of Gross",
  ATTENDANCE_DAYS: "× Work Days",
  WORK_HOURS: "× Work Hours",
  OVERTIME_HOURS: "× OT Hours",
  PERCENT_TOTAL_EARNINGS: "% of Total Earnings",
  PERCENT_GROSS_TAXABLE: "% of Total Taxable Earnings",
  FORMULA: "Custom Formula",
}

interface ManualProps {
  editingData: SerializedComponentMaster | null
  currentCategory: string
  onCategoryChange: (val: string | string[]) => void
}

export function MasterComponentManual({ editingData, currentCategory, onCategoryChange }: ManualProps) {
  return (
    <div className="space-y-5 mt-0">
      {editingData && <input type="hidden" name="id" value={editingData.id} />}
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Component Name"
          name="name"
          placeholder="e.g. Uang Makan"
          defaultValue={editingData?.name}
          required
        />
        <FormSelect
          label="Type"
          name="category"
          defaultValue={currentCategory}
          onChange={onCategoryChange}
          options={[
            { label: "Earning (+)", value: "EARNING" },
            { label: "Deduction (-)", value: "DEDUCTION" },
          ]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Preset Group (Optional)"
          name="groupName"
          placeholder="e.g. Staff Tetap"
          defaultValue={editingData?.groupName ?? ""} 
        />
        <FormSelect
          label="Subject to Tax"
          name="isTaxable"
          defaultValue={editingData ? String(editingData.isTaxable) : "true"}
          options={[
            { label: "Taxable", value: "true" },
            { label: "Tax Exempt", value: "false" },
          ]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Calculation Base"
          name="base"
          defaultValue={editingData?.base || "FIXED"}
          options={Object.entries(BASE_LABELS).map(([v, l]) => ({ label: l, value: v }))}
          required
        />
        <FormInput
          label="Default Value"
          name="defaultAmount"
          type="number"
          placeholder="0"
          defaultValue={editingData?.defaultAmount ?? 0}
          required
        />
      </div>

      <FormInput
        label="Description (optional)"
        name="description"
        placeholder="e.g. Daily meal allowance per attendance day"
        defaultValue={editingData?.description ?? ""}
      />

      {currentCategory === "DEDUCTION" && (
        <FormSelect
          label="Deduction Strategy"
          name="deductionType"
          defaultValue={editingData?.deductionType || "POST_TAX"}
          options={[
            { label: "Pre-Tax (Reduce Gross)", value: "PRE_TAX" },
            { label: "Post-Tax (Take Home Pay)", value: "POST_TAX" },
          ]}
        />
      )}

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-600 leading-relaxed">
          With <strong>{BASE_LABELS[(editingData?.base || "FIXED") as CalculationBase]}</strong>,
          this component will be processed as a {currentCategory.toLowerCase()}.
        </p>
      </div>
    </div>
  )
}