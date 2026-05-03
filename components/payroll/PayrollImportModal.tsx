"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Sparkles } from "lucide-react"
import { bulkGeneratePayroll } from "@/actions/payroll-actions"
import { toast } from "sonner"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { SubmitButton } from "@/components/data-table/submit-button"
import PayrollManualEntry from "./PayrollManualEntry"

interface Props {
  onSuccess?: (status: string) => void
}

export default function PayrollImportModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const month = formData.get("month") as string
      const year = formData.get("year") as string

      const res = await bulkGeneratePayroll(parseInt(month), parseInt(year))
      
      if (res.success) {
        setOpen(false)
        onSuccess?.("DRAFT")
        router.refresh()
        toast.success(`Generated ${res.count} payroll records!`, {
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        })
      } else {
        toast.error(res.error || "Failed to process payroll")
      }
    } finally {
      setLoading(false)
    }
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
            loading={loading} 
            label="Process & Generate Payroll" 
            loadingLabel="Processing..."
            className="rounded-xl h-11 w-full font-semibold" 
          />
        </form>
      </EntryDialog>
    </>
  )
}