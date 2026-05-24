"use client"

import { ShieldCheck, AlertCircle } from "lucide-react"
import { AnalyticsCard } from "@/components/data-table/analytics-card"
import { MilestoneItem } from "@/components/data-table/milestone-item"
import { EmployeeWithRelations } from "@/types/employee"

interface DataHealthProps {
  data: EmployeeWithRelations[]
}

export function EmployeeDataHealth({ data }: DataHealthProps) {
  const incompleteStaff = data.filter((emp) => {
    return (
      !emp.identityNumber || emp.identityNumber === "-" ||
      !emp.taxId || emp.taxId === "-" ||
      !emp.bankAccount || emp.bankAccount === "-"
    )
  })

  const totalEmployees = data.length
  const healthyEmployees = totalEmployees - incompleteStaff.length
  const healthPercentage = totalEmployees > 0 
    ? Math.round((healthyEmployees / totalEmployees) * 100) 
    : 0

  const displayStaff = incompleteStaff.slice(0, 5)

  return (
    <AnalyticsCard
      title="Data Health Monitor"
      subtitle={`${healthPercentage}% Profile Completion`}
      className="shrink-0"
    >
      <div className="flex flex-col gap-4">
        {incompleteStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[12px] font-semibold text-slate-800">Data Fully Compliant</p>
            <p className="text-[10px] text-slate-400 mt-1">All employee documents are up to date.</p>
          </div>
        ) : (
          <>
            {displayStaff.map((emp) => {
              let missingLabel = "Incomplete Profile"
              if (!emp.identityNumber || emp.identityNumber === "-") missingLabel = "Missing NIK"
              else if (!emp.taxId || emp.taxId === "-") missingLabel = "Missing Tax ID"
              else if (!emp.bankAccount || emp.bankAccount === "-") missingLabel = "Missing Bank Account"

              return (
                <MilestoneItem
                  key={emp.id}
                  label={emp.fullName}
                  description={missingLabel}
                  date="Action"
                  icon={AlertCircle}
                  iconBg="bg-rose-50"
                  iconColor="text-rose-600"
                />
              )
            })}

            {incompleteStaff.length > 5 && (
              <p className="text-[10px] text-slate-400 text-center italic mt-2 border-t border-slate-50 pt-3">
                And {incompleteStaff.length - 5} other profiles need attention
              </p>
            )}
          </>
        )}
      </div>
    </AnalyticsCard>
  )
}