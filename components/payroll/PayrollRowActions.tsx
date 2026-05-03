"use client"

import { Button } from "@/components/ui/button"
import { updatePayrollStatus } from "@/actions/payroll-actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { PayrollStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  status: PayrollStatus
}

export function PayrollRowActions({ id, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpdate = (newStatus: PayrollStatus) => {
    startTransition(async () => {
      await updatePayrollStatus(id, newStatus)
      router.refresh()
    })
  }

  const getActionConfig = () => {
    switch (status) {
      case PayrollStatus.DRAFT:
        return {
          label: "SUBMIT",
          target: PayrollStatus.PENDING,
          className: "bg-purple-600 hover:bg-purple-700 text-white border-none",
          disabled: false
        }
      case PayrollStatus.PENDING:
        return {
          label: "APPROVE",
          target: PayrollStatus.APPROVED,
          className: "bg-blue-600 hover:bg-blue-700 text-white border-none",
          disabled: false
        }
      case PayrollStatus.APPROVED:
        return {
          label: "MARK PAID",
          target: PayrollStatus.PAID,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
          disabled: false
        }
      case PayrollStatus.PAID:
        return {
          label: "PAID",
          target: null,
          className: "bg-slate-100 text-slate-400 border-none cursor-not-allowed",
          disabled: true
        }
      default:
        return null
    }
  }

  const config = getActionConfig()
  if (!config) return null

  return (
    <Button 
      size="sm" 
      className={cn(
        "h-7 px-4 rounded-sm transition-all font-poppins font-bold text-[10px]", 
        config.className
      )}
      disabled={isPending || config.disabled}
      onClick={() => config.target && handleUpdate(config.target)}
    >
      {isPending ? "PROCESSING..." : config.label}
    </Button>
  )
}