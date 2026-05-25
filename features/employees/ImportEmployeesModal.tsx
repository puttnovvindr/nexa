"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmploymentType, JobLevel, WorkSchedule, OrganizationUnit } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { JobWithDetails } from "@/types/employee"
import ManualImportForm from "./ManualImportForm"
import ExcelImportSection from "./ExcelImportSection"

interface ImportEmployeeModalProps {
  orgUnits: OrganizationUnit[]
  jobs: JobWithDetails[]
  jobLevels: JobLevel[] 
  employmentTypes: EmploymentType[]
  workSchedules: WorkSchedule[]
}

export default function ImportEmployeeModal({ 
  orgUnits,
  jobs, 
  jobLevels, 
  employmentTypes,
  workSchedules 
}: ImportEmployeeModalProps) {
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

  return (
    <>
      <TableAddButton
        label="Import Employee"
        icon={UserPlus}
        onClick={() => setOpen(true)}
      />

      <EntryDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Manage Employee"
        description={
          hasExcelData
            ? "Petakan kolom Excel Anda ke dalam field data karyawan"
            : "Tambah data karyawan secara manual atau unggah massal melalui Excel"
        }
        showFooter={false}
        className={cn(
          "transition-all duration-300 ease-in-out font-poppins flex flex-col items-stretch justify-start outline-none overflow-hidden",
          activeTab === "excel" && hasExcelData
            ? "max-w-7xl lg:max-w-[1250px] h-[92vh] p-6"
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
            <ManualImportForm 
              orgUnits={orgUnits} 
              jobs={jobs} 
              jobLevels={jobLevels} 
              employmentTypes={employmentTypes} 
              workSchedules={workSchedules}
              onSuccess={() => handleOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent 
            value="excel" 
            className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0 outline-none"
          >
            <ExcelImportSection 
              onDataLoaded={setHasExcelData} 
              onFinish={() => handleOpenChange(false)} 
            />
          </TabsContent>
        </Tabs>
      </EntryDialog>
    </>
  )
}