"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { EmploymentType, JobLevel, WorkSchedule, OrganizationUnit } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { StatusDialog } from "@/components/data-table/status-dialog" 
import { saveManualEmployee } from "@/actions/employee-actions"
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
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [hasExcelData, setHasExcelData] = useState(false)
  
  const [status, setStatus] = useState({
    open: false,
    success: false,
    message: ""
  })

  const router = useRouter()

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await saveManualEmployee(formData)
      
      if (result.success) {
        setOpen(false)
        setStatus({
          open: true,
          success: true,
          message: "Employee data has been successfully saved to the system."
        })
        router.refresh()
      } else {
        setStatus({
          open: true,
          success: false,
          message: result.error || "Failed to save. Please check if Employee ID or Email already exists."
        })
      }
    } catch (error) {
      setStatus({
        open: true,
        success: false,
        message: "An unexpected error occurred. Please try kembali."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TableAddButton 
        label="Add Employee" 
        icon={UserPlus} 
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
        title="Add New Employee"
        description={hasExcelData ? "Map your excel columns to employee fields" : "Add employee manually or bulk upload via excel file"}
        showFooter={false}
        className={cn(
          "transition-all duration-300 ease-in-out font-poppins",
          activeTab === "excel" && hasExcelData 
            ? "max-w-[95vw] lg:max-w-[1250px] h-[92vh] p-6"
            : "max-w-lg p-10" 
        )}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col min-h-0">
          <div className="shrink-0 mb-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl shadow-none">
              <TabsTrigger value="manual" className="rounded-xl font-semibold tracking-wider text-[12px] cursor-pointer">
                Manual Input
              </TabsTrigger>
              <TabsTrigger value="excel" className="rounded-xl font-semibold tracking-wider text-[12px] cursor-pointer">
                Bulk Upload
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="manual" className="pt-2 px-1 overflow-y-auto min-h-0 flex-1 custom-scroll">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <ManualImportForm 
                orgUnits={orgUnits} 
                jobs={jobs} 
                jobLevels={jobLevels} 
                employmentTypes={employmentTypes} 
                workSchedules={workSchedules}
                loading={loading}
              />
            </form>
          </TabsContent>
          
          <TabsContent value="excel" className="flex-1 min-h-0 flex flex-col overflow-hidden mt-0">
            <ExcelImportSection 
              onDataLoaded={setHasExcelData} 
              onFinish={(res) => { if(res.success) { setOpen(false); router.refresh(); } }} 
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