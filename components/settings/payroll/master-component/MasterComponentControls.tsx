"use client"

import React, { useState } from "react"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SerializedComponentMaster } from "@/types/payroll"
import MasterComponentBulk from "./MasterComponentBulk"
import { MasterComponentManual } from "./MasterComponentManual"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: SerializedComponentMaster | null
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBulkFinish: () => void
}

export function MasterComponentControls({
  open,
  onOpenChange,
  editingData,
  isPending,
  onSubmit,
  onBulkFinish,
}: Props) {
  const [activeTab, setActiveTab] = useState("manual")
  const [hasExcelData, setHasExcelData] = useState(false)
  const [manualCategory, setManualCategory] = useState<string | null>(null)

  const currentCategory = manualCategory ?? (editingData?.category || "EARNING")

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setActiveTab("manual")
      setHasExcelData(false)
      setManualCategory(null)
    }
  }

  return (
    <EntryDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={editingData ? "Edit Component" : "Add Component"}
      description="Define how this payroll component is calculated"
      onSubmit={activeTab === "manual" ? onSubmit : undefined}
      isPending={isPending}
      confirmText={editingData ? "Update Component" : "Save Component"}
      showFooter={activeTab === "manual"}
      className={cn(
        "transition-all duration-300 ease-in-out font-poppins",
        activeTab === "bulk" && hasExcelData
          ? "max-w-[95vw] lg:max-w-[1100px] h-[88vh] p-6"
          : "max-w-xl"
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0">
        {!editingData && (
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 p-1 rounded-xl shrink-0 h-10 mb-4">
            <TabsTrigger value="manual" className="rounded-lg font-bold text-[12px] cursor-pointer data-[state=active]:bg-white data-[state=active]:text-violet-700 shadow-none">
              Manual Input
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg font-bold text-[12px] cursor-pointer data-[state=active]:bg-white data-[state=active]:text-violet-700 shadow-none">
              Bulk Upload
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="manual" className="mt-0 outline-none">
          <MasterComponentManual 
            editingData={editingData}
            currentCategory={currentCategory}
            onCategoryChange={(val) => {
              const selected = Array.isArray(val) ? val[0] : val
              setManualCategory(selected)
            }}
          />
        </TabsContent>

        {!editingData && (
          <TabsContent value="bulk" className="flex-1 flex flex-col min-h-0 mt-0 outline-none">
            <MasterComponentBulk
              onDataLoaded={setHasExcelData}
              onFinish={(result) => {
                if (result.success) {
                  handleOpenChange(false)
                  onBulkFinish()
                }
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </EntryDialog>
  )
}