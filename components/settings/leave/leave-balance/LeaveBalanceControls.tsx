"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { LeaveBalanceControlsProps } from "@/types/leave"
import { ActionResponse } from "@/types/leave"
import ManualLeaveBalanceForm from "./ManualLeaveBalanceForm"
import LeaveExcelImportSection from "./LeaveExcelImportSection"

export function LeaveBalanceControls({
  allEmployees,
  leaveTypes,
  editingData,
  open,
  onOpenChange,
  isPending,
  onSubmit,
  onBulkFinish,
}: LeaveBalanceControlsProps) {
  const router = useRouter()
  const [hasExcelData, setHasExcelData] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  
  const [status, setStatus] = useState({
    open: false,
    success: false,
    message: ""
  })

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setHasExcelData(false)
      setActiveTab("manual")
    }
  }

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const result = (await onSubmit(e)) as unknown as ActionResponse 
      
      if (result && result.success) {
        onOpenChange(false)
        setStatus({
          open: true,
          success: true,
          message: editingData 
            ? "Leave entitlement has been updated successfully." 
            : "New leave balance has been successfully assigned."
        })
        router.refresh()
      } else {
        setStatus({
          open: true,
          success: false,
          message: result?.error || "Failed to process request."
        })
      }
    } catch (error: unknown) {
      setStatus({
        open: true,
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred."
      })
    }
  }

  return (
    <>
      <EntryDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editingData ? "Edit Leave Entitlement" : "Add New Leave Balance"}
        description={
          activeTab === "excel" && hasExcelData
            ? "Map your excel columns to leave balance fields"
            : "Set entitlement manually or bulk upload via excel file"
        }
        showFooter={false}
        className={cn(
          "transition-all duration-300 ease-in-out font-poppins overflow-hidden",
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
                disabled={!!editingData}
              >
                Bulk Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="manual"
            className="pt-2 px-1 overflow-y-auto min-h-0 flex-1 custom-scroll outline-none"
          >
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <ManualLeaveBalanceForm
                allEmployees={allEmployees}
                leaveTypes={leaveTypes}
                editingData={editingData}
                loading={isPending}
              />
            </form>
          </TabsContent>

          <TabsContent
            value="excel"
            className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0 outline-none"
          >
            <LeaveExcelImportSection
              onDataLoaded={setHasExcelData}
              onFinish={(res) => {
                if (res.success) {
                  onOpenChange(false)
                  router.refresh()
                }
                onBulkFinish(res)
              }}
            />
          </TabsContent>
        </Tabs>
      </EntryDialog>

      <StatusDialog 
        open={status.open}
        success={status.success}
        message={status.message}
        onClose={() => setStatus(prev => ({ ...prev, open: false }))}
      />
    </>
  )
}