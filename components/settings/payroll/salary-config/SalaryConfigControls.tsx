"use client"

import React, { useState } from "react"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SerializedSalaryConfig, SerializedComponentMaster } from "@/types/payroll"
import { SalaryConfigManual } from "./SalaryConfigManual"
import SalaryConfigBulk from "./SalaryConfigBulk"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingData: SerializedSalaryConfig | null
  allEmployees: { id: string; employeeId: string; fullName: string }[]
  masters: SerializedComponentMaster[]
  salaryConfigs: SerializedSalaryConfig[]
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBulkFinish: () => void
}

export function SalaryConfigControls({
  open,
  onOpenChange,
  editingData,
  allEmployees,
  masters,
  salaryConfigs,
  isPending,
  onSubmit,
  onBulkFinish,
}: Props) {
  const [activeTab, setActiveTab] = useState("manual")
  const [hasData, setHasData] = useState(false)

  const configuredIds = new Set(salaryConfigs.map((c) => c.employeeId))
  const unconfiguredEmployees = allEmployees.filter((e) => !configuredIds.has(e.id))

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setActiveTab("manual")
      setHasData(false)
    }
  }

  return (
    <EntryDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={editingData ? "Edit Salary Config" : "Add Salary Config"}
      description={
        activeTab === "bulk" && hasData 
          ? "Map your excel columns to salary configuration fields" 
          : "Define base pay and employment basis"
      }
      onSubmit={activeTab === "manual" ? onSubmit : undefined}
      isPending={isPending}
      confirmText={editingData ? "Update Config" : "Initialize & Save"}
      showFooter={activeTab === "manual"}
      className={cn(
        "transition-all duration-300 ease-in-out font-poppins",
        activeTab === "bulk" && hasData 
          ? "max-w-[95vw] lg:max-w-[1250px] h-[92vh] p-6" 
          : "max-w-lg p-10"
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col min-h-0">
        <div className="shrink-0 mb-2">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl shadow-none h-10">
            <TabsTrigger 
              value="manual" 
              className="rounded-lg font-bold text-[12px] data-[state=active]:bg-white data-[state=active]:text-violet-700"
            >
              Manual Input
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="rounded-lg font-bold text-[12px] data-[state=active]:bg-white data-[state=active]:text-violet-700"
              disabled={!!editingData}
            >
              Bulk Upload
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent 
          value="manual" 
          className="pt-2 px-1 overflow-y-auto min-h-0 flex-1 hide-scrollbar outline-none"
        >
          <SalaryConfigManual 
            editingData={editingData} 
            unconfiguredEmployees={unconfiguredEmployees} 
            masters={masters} 
          />
        </TabsContent>

        <TabsContent 
          value="bulk" 
          className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0 outline-none"
        >
          <SalaryConfigBulk 
            onDataLoaded={setHasData} 
            onFinish={(res) => { 
              if (res.success) { 
                handleOpenChange(false)
                onBulkFinish() 
              } 
            }} 
          />
        </TabsContent>
      </Tabs>
    </EntryDialog>
  )
}