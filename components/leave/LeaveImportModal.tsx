"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ClipboardList } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { SubmitButton } from "@/components/data-table/submit-button"
import { createLeave } from "@/actions/leave-actions"
import { LeaveType, ImportResult } from "@/types/leave"
import LeaveManualEntry from "./LeaveManualEntry"
import LeaveExcelImportSection from "./LeaveExcelImportSection"
import { useRouter } from "next/navigation"

interface LeaveImportModalProps {
  leaveTypes: LeaveType[]
}

export default function LeaveImportModal({ leaveTypes }: LeaveImportModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [hasExcelData, setHasExcelData] = useState(false)

  const [status, setStatus] = useState({
    open: false,
    success: false,
    message: "",
  })

  const router = useRouter()

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const rawData = {
        employeeId: formData.get("employeeId") as string,
        leaveTypeId: formData.get("leaveTypeId") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        reason: (formData.get("reason") as string) ?? undefined,
      }

      const result = await createLeave(rawData)

      if (result.success) {
        setOpen(false)
        setStatus({
          open: true,
          success: true,
          message: "Leave request has been successfully submitted.",
        })
        router.refresh()
      } else {
        setStatus({
          open: true,
          success: false,
          message: result.message ?? "Failed to submit leave request. Please try again.",
        })
      }
    } catch {
      setStatus({
        open: true,
        success: false,
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExcelFinish = (res: ImportResult) => {
    if (res.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <TableAddButton
        label="Add Leave"
        icon={ClipboardList}
        onClick={() => setOpen(true)}
      />

      <EntryDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            setHasExcelData(false)
            setActiveTab("manual")
          }
        }}
        title="Add New Leave Request"
        description={
          hasExcelData
            ? "Map your Excel columns to leave fields"
            : "Add a leave request manually or bulk upload via Excel file"
        }
        showFooter={false}
        className={cn(
          "transition-all duration-300 ease-in-out font-poppins",
          activeTab === "excel" && hasExcelData
            ? "max-w-[95vw] lg:max-w-[1250px] h-[92vh] p-6"
            : "max-w-lg p-10"
        )}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col min-h-0"
        >
          <div className="shrink-0 mb-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl shadow-none">
              <TabsTrigger
                value="manual"
                className="rounded-xl font-semibold tracking-wider text-[12px] cursor-pointer"
              >
                Manual Input
              </TabsTrigger>
              <TabsTrigger
                value="excel"
                className="rounded-xl font-semibold tracking-wider text-[12px] cursor-pointer"
              >
                Bulk Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="manual"
            className="pt-2 px-1 overflow-y-auto min-h-0 flex-1 custom-scroll"
          >
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <LeaveManualEntry leaveTypes={leaveTypes} />
              <SubmitButton
                loading={loading}
                label="Save Leave"
                loadingLabel="Saving..."
                className="rounded-xl h-11 w-full"
              />
            </form>
          </TabsContent>

          <TabsContent
            value="excel"
            className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0"
          >
            <LeaveExcelImportSection
              onDataLoaded={setHasExcelData}
              onFinish={handleExcelFinish}
            />
          </TabsContent>
        </Tabs>
      </EntryDialog>

      <StatusDialog
        open={status.open}
        success={status.success}
        message={status.message}
        onClose={() => setStatus((prev) => ({ ...prev, open: false }))}
      />
    </>
  )
}