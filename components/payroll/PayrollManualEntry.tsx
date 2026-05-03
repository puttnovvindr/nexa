"use client"

import { FormSelect } from "@/components/data-table/form-elements"

export default function PayrollManualEntry() {
  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ]

  const currentYear = new Date().getFullYear()
  const years = [
    { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
    { label: currentYear.toString(), value: currentYear.toString() },
    { label: (currentYear + 1).toString(), value: (currentYear + 1).toString() },
  ]

  return (
    <div className="space-y-6 w-full font-poppins">
      <div className="grid grid-cols-2 gap-5">
        <FormSelect
          label="Payroll Month"
          name="month"
          placeholder="Select Month"
          options={months}
          defaultValue={(new Date().getMonth() + 1).toString()}
        />

        <FormSelect
          label="Payroll Year"
          name="year"
          placeholder="Select Year"
          options={years}
          defaultValue={currentYear.toString()}
        />
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          <span className="font-bold text-[#1E293B] block mb-1">Note:</span>
          Generating payroll will calculate basic salary and overtime for all active employees 
          based on their current salary configuration.
        </p>
      </div>
    </div>
  )
}