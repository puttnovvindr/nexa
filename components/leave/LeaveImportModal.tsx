"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ClipboardList } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { LeaveType, ImportResult } from "@/types/leave"
import LeaveManualEntry from "./LeaveManualEntry"
import LeaveExcelImportSection from "./LeaveExcelImportSection"

interface LeaveImportModalProps {
  leaveTypes: LeaveType[]
}

export default function LeaveImportModal({ leaveTypes }: LeaveImportModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [hasExcelData, setHasExcelData] = useState(false)

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setHasExcelData(false)
      setActiveTab("manual")
    }
  }

  const handleExcelFinish = (res: ImportResult) => {
    if (res.success) {
      handleOpenChange(false)
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
        onOpenChange={handleOpenChange}
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

            <LeaveManualEntry 
              leaveTypes={leaveTypes} 
              onSuccess={() => handleOpenChange(false)} 
            />
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
    </>
  )
}