"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveManualEmployee } from "@/actions/employee-actions"
import ManualImportForm from "./ManualImportForm"
import ExcelImportSection from "./ExcelImportSection"
import { JobWithDetails } from "@/types/employee"
import { EmploymentType, JobLevel } from "@prisma/client" 
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ImportEmployeeModalProps {
  jobs: JobWithDetails[]
  jobLevels: JobLevel[] 
  employmentTypes: EmploymentType[]
}

export default function ImportEmployeeModal({ 
  jobs, 
  jobLevels, 
  employmentTypes 
}: ImportEmployeeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [hasExcelData, setHasExcelData] = useState(false)
  const router = useRouter()

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await saveManualEmployee(formData)
    setLoading(false)
    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) { 
        setHasExcelData(false)
        setActiveTab("manual")
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] cursor-pointer text-white rounded-sm gap-2 font-bold px-5 h-11 shadow-none transition-transform active:scale-95">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </DialogTrigger>
      
      <DialogContent className={cn(
        "bg-white rounded-2xl border-none shadow-2xl transition-all duration-300 p-0 overflow-hidden flex flex-col",
        activeTab === "excel" && hasExcelData ? "sm:max-w-[1200px] h-[85vh]" : "sm:max-w-[500px] h-auto"
      )}>
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">Add New Employee</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-6 shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl shadow-none h-11">
              <TabsTrigger value="manual" className="rounded-lg font-semibold shadow-none">Manual Input</TabsTrigger>
              <TabsTrigger value="excel" className="rounded-lg font-semibold shadow-none">Bulk Upload</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="manual" className="p-6 pt-2 overflow-y-auto">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <ManualImportForm 
                jobs={jobs} 
                jobLevels={jobLevels} 
                employmentTypes={employmentTypes} 
              />
              <Button type="submit" disabled={loading} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] cursor-pointer text-white h-12 rounded-xl font-bold shadow-none">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Employee"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="excel" className="px-6 pb-6 pt-2 flex-1 min-h-0 overflow-hidden">
            <ExcelImportSection 
              onDataLoaded={setHasExcelData} 
              onFinish={(res) => { if(res.success) { setOpen(false); router.refresh(); } }} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}