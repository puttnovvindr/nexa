"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TableSearch } from "@/components/data-table/table-search"
import { TableFilter } from "@/components/data-table/table-filter"
import { AttendanceStats } from "./AttendanceStats"
import AttendanceTable from "./AttendanceTable"
import AttendanceImportModal from "./AttendanceImportModal"
import { AttendanceWithEmployee } from "@/types/attendance"
import { Job, JobLevel, EmploymentType } from "@prisma/client"
import { ImportResult } from "@/types/leave"

import { toast } from "sonner"

interface AttendanceClientProps {
  data: AttendanceWithEmployee[]
  stats: {
    totalPresent: number
    totalLate: number
    totalAbsent: number
    onTimeRate: number
  }
  jobs?: (Job & { orgUnit: { name: string } })[]
  jobLevels?: JobLevel[]
  employmentTypes?: EmploymentType[]
}

const ATTENDANCE_STATUS_OPTIONS = [
  { id: "PRESENT", label: "Present" },
  { id: "LATE", label: "Late" },
  { id: "ABSENT", label: "Absent" },
  { id: "ON_LEAVE", label: "On Leave" },
]

export default function AttendanceClient({
  data,
  stats,
}: AttendanceClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])

  const shiftOptions = useMemo(() => {
    const unique = new Map<string, string>()
    data?.forEach((log) => {
      if (log.workSchedule?.shiftName) {
        unique.set(log.workSchedule.shiftName, log.workSchedule.shiftName)
      }
    })
    return Array.from(unique.entries()).map(([id, label]) => ({ id, label }))
  }, [data])

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        setIsModalOpen(false)
        router.refresh()
        toast.success("Attendance recorded successfully")
        // }
      } catch (error) {
        toast.error("Failed to record attendance")
      }
    })
  }

  const handleBulkFinish = (result: ImportResult) => {
    if (result.success) {
      setIsModalOpen(false)
      router.refresh()
      toast.success(result.message || "Bulk import completed")
    } else {
      toast.error(result.error || "Import failed")
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full font-poppins">
      <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-6 px-7 rounded-2xl shadow-lg shadow-purple-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
        <div className="relative z-10 flex flex-col text-left">
          <h1 className="text-[16px] font-bold tracking-tight text-white uppercase">
            Attendance Management
          </h1>
          <p className="text-white/80 text-[12px] font-medium leading-tight mt-1 max-w-[500px]">
            Monitor employee attendance and identify patterns across shifts and work schedules
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden gap-6 text-left">
          
          <div className="shrink-0">
            <AttendanceStats data={data} />
          </div>

          <div className="flex justify-between items-center gap-4 shrink-0">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by employee name..."
            />

            <div className="flex items-center gap-3">
              <TableFilter
                categories={[
                  {
                    id: "status",
                    label: "Status",
                    options: ATTENDANCE_STATUS_OPTIONS,
                    selectedValues: selectedStatus,
                    onUpdate: setSelectedStatus,
                  },
                  {
                    id: "shift",
                    label: "Shift",
                    options: shiftOptions,
                    selectedValues: selectedShifts,
                    onUpdate: setSelectedShifts,
                  },
                ]}
              />
              
              <AttendanceImportModal 
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                isPending={isPending}
                onManualSubmit={handleManualSubmit}
                onBulkFinish={handleBulkFinish}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AttendanceTable
              data={data}
              search={search}
              selectedStatus={selectedStatus}
              selectedShifts={selectedShifts}
            />
          </div>
        </div>
      </div>
    </div>
  )
}