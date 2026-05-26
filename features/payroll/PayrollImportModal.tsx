"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Sparkles } from "lucide-react"
import { bulkGeneratePayroll } from "@/actions/payroll-actions"
import { toast } from "sonner"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { SubmitButton } from "@/components/data-table/submit-button"
import { useCrudHandler } from "@/hooks/use-crud-handler"
import PayrollManualEntry from "./PayrollManualEntry"

interface Props {
  onSuccess?: (status: string) => void
}

export default function PayrollImportModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { isPending, handleAction } = useCrudHandler()

  const handleGenerateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const month = formData.get("month") as string
    const year = formData.get("year") as string

    await handleAction(
      bulkGeneratePayroll(parseInt(month), parseInt(year)),
      "",
      () => {
        setOpen(false)
        onSuccess?.("DRAFT")
        router.refresh()
        toast.success("Generated payroll records successfully!", {
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        })
      }
    )
  }

  return (
    <>
      <TableAddButton 
        label="Generate Payroll" 
        icon={Wallet} 
        onClick={() => setOpen(true)}
      />

      <EntryDialog
        open={open}
        onOpenChange={setOpen}
        title="Generate Payroll"
        description="Calculate monthly employee salaries based on configurations"
        showFooter={false}
        className="max-w-lg p-10 font-poppins"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-8">
          <PayrollManualEntry />
          <SubmitButton 
            loading={isPending} 
            label="Process & Generate Payroll" 
            loadingLabel="Processing..."
            className="rounded-xl h-11 w-full font-semibold" 
          />
        </form>
      </EntryDialog>
    </>
  )
}