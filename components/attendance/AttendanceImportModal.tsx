"use client"

import { useState } from "react"
import { ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { AttendanceImportModalProps } from "@/types/attendance"
import AttendanceManualEntry from "./AttendanceManualEntry"
import AttendanceImportSection from "./AttendanceImportSection"

export default function AttendanceImportModal({
  open,
  onOpenChange,
  isPending,
  onManualSubmit,
  onBulkFinish,
}: AttendanceImportModalProps) {
  const [hasExcelData, setHasExcelData] = useState(false)
  const [activeTab, setActiveTab]       = useState<string>("manual")

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setHasExcelData(false)
      setActiveTab("manual")
    }
  }

  return (
    <>
      <TableAddButton
        label="Import Attendance"
        icon={ClipboardList}
        onClick={() => onOpenChange(true)}
      />

      <EntryDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Manage Attendance"
        description={
          hasExcelData
            ? "Map your Excel columns to attendance fields"
            : "Add a record manually or bulk-upload via Excel"
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
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl shadow-none border-none">
              <TabsTrigger
                value="manual"
                className="rounded-xl font-semibold tracking-wider text-[12px] cursor-pointer"
              >
                Manual Entry
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
            <form onSubmit={onManualSubmit} className="space-y-4">
              <AttendanceManualEntry loading={isPending} />
            </form>
          </TabsContent>

          <TabsContent
            value="excel"
            className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0 outline-none"
          >
            <AttendanceImportSection
              onDataLoaded={setHasExcelData}
              onFinish={onBulkFinish}
            />
          </TabsContent>
        </Tabs>
      </EntryDialog>
    </>
  )
}