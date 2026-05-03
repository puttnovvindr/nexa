"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { deleteAttendance } from "@/actions/attendance-actions"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableContainer } from "@/components/data-table/table-container"
import { TableData } from "@/components/data-table/table-data"
import { TablePagination } from "@/components/data-table/table-pagination"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { useDataTable } from "@/hooks/use-data-table"
import { cn } from "@/lib/utils"
import { AttendanceWithEmployee } from "@/types/attendance"
import { Job, JobLevel, EmploymentType } from "@prisma/client"

interface Props {
  data: AttendanceWithEmployee[]
  search: string
  selectedStatus: string[]
  selectedShifts: string[]
  jobs?: (Job & { orgUnit: { name: string } })[]
  jobLevels?: JobLevel[]
  employmentTypes?: EmploymentType[]
}

type FlattenedAttendance = AttendanceWithEmployee & {
  employeeName: string
  employeeIdStr: string
  statusLabel: string
  shiftName: string
} & Record<string, unknown>

const STATUS_STYLES: Record<string, string> = {
  PRESENT:  "bg-[#DCFCE7] text-[#15803D]",
  LATE:     "bg-[#FEF3C7] text-[#92400E]",
  ABSENT:   "bg-[#FEE2E2] text-[#B91C1C]",
  ON_LEAVE: "bg-[#E0E7FF] text-[#4338CA]",
}

function formatOvertime(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}j ${m}m` : `${m}m`
}

export default function AttendanceTable({
  data,
  search,
  selectedStatus,
  selectedShifts,
}: Props) {
  const router = useRouter()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const flattenedData = useMemo<FlattenedAttendance[]>(() => {
    return data.map((log) => ({
      ...log,
      employeeName:  log.employee?.fullName        || "Unknown",
      employeeIdStr: log.employee?.employeeId      || "N/A",
      statusLabel:   log.status                    || "ABSENT",
      shiftName:     log.workSchedule?.shiftName   || "",
    }))
  }, [data])

  const filteredData = useMemo(() => {
    return flattenedData.filter((log) => {
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(log.statusLabel)
      const matchesShift  = selectedShifts.length === 0 || selectedShifts.includes(log.shiftName)
      return matchesStatus && matchesShift
    })
  }, [flattenedData, selectedStatus, selectedShifts])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } =
    useDataTable<FlattenedAttendance, string>({
      data: filteredData,
      searchKey: "employeeName",
      initialSortKey: "date",
      externalSearch: search,
    })

  const handleDelete = async () => {
    if (!deleteId) return
    setIsPending(true)
    try {
      const result = await deleteAttendance(deleteId)
      if (result.success) {
        setAlertConfig({ open: true, success: true, message: "Attendance log deleted!" })
        setDeleteId(null)
        router.refresh()
      }
    } catch {
      setAlertConfig({ open: true, success: false, message: "Failed to delete." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full space-y-5 text-left font-poppins">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableSortHeader label="Employee"  onClick={() => toggleSort("employeeName")} className="w-[180px]" />
              <TableSortHeader label="Date"      onClick={() => toggleSort("date")}         className="w-[160px]" />
              <TableSortHeader label="Schedule"  onClick={() => toggleSort("schedule")}     className="w-[110px]" />
              <TableSortHeader label="Check In"  onClick={() => toggleSort("checkIn")}      className="w-[90px]"  />
              <TableSortHeader label="Check Out" onClick={() => toggleSort("checkOut")}     className="w-[90px]"  />
              <TableSortHeader label="Overtime"  onClick={() => toggleSort("status")}       className="w-[110px]" />
              <TableSortHeader label="Status"    onClick={() => toggleSort("statusLabel")}  className="w-[120px]" />
              <TableSortHeader label="Notes"     onClick={() => toggleSort("notes")}        className="w-[150px]" />
              <TableSortHeader label="Action"    isAction                                   className="w-[90px]"  />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={9}
                message="No attendance logs found"
                description="Try to adjust your search or filters"
              />
            ) : (
              paginatedData.map((log) => (
                <TableRow key={log.id}>
                  <TableData variant="primary">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate block">{log.employeeName}</span>
                      <span className="text-[12px] text-gray-400 truncate block font-semibold">
                        {log.employeeIdStr}
                      </span>
                    </div>
                  </TableData>

                  <TableData variant="secondary">
                    {format(new Date(log.date), "EEE, dd MMM yyyy")}
                  </TableData>

                  <TableData variant="secondary">
                    <Badge className="bg-gray-100 text-[#1E293B] border-none px-3 py-1 rounded-xl font-semibold text-[10px] min-w-[80px] justify-center shadow-none">
                      {log.shiftName || "N/A"}
                    </Badge>
                  </TableData>

                  <TableData variant="secondary" className="text-center">
                    <span className={cn("text-[12px] font-semibold", log.checkIn ? "text-[#1E293B]" : "text-gray-300")}>
                      {log.checkIn ? format(new Date(log.checkIn as Date), "HH:mm") : "--:--"}
                    </span>
                  </TableData>

                  <TableData variant="secondary" className="text-center">
                    <span className={cn("text-[12px] font-semibold", log.checkOut ? "text-[#1E293B]" : "text-gray-300")}>
                      {log.checkOut ? format(new Date(log.checkOut as Date), "HH:mm") : "--:--"}
                    </span>
                  </TableData>

                  <TableData variant="secondary" className="text-center">
                    {log.overtimeMinutes && log.overtimeMinutes > 0 ? (
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 font-semibold text-[10px] shadow-none">
                        +{formatOvertime(log.overtimeMinutes)}
                      </Badge>
                    ) : (
                      <span className="text-gray-300 text-[11px]">-</span>
                    )}
                  </TableData>

                  <TableData variant="secondary" className="text-center">
                    <Badge className={cn(
                      "px-4 py-1 rounded-full font-semibold px-3 py-1 text-[10px] border-none shadow-none",
                      STATUS_STYLES[log.statusLabel] ?? "bg-gray-100 text-gray-600"
                    )}>
                      {log.statusLabel}
                    </Badge>
                  </TableData>

                  <TableData variant="secondary">
                    <div className="max-w-[140px]">
                      {log.notes ? (
                        <span>
                          {log.notes}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                  </TableData>

                  <TableData variant="action">
                    <TableRowActions onEdit={() => {}} onDelete={() => setDeleteId(log.id)} />
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirm
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        isPending={isPending}
        onConfirm={handleDelete}
      />

      <StatusDialog
        open={alertConfig.open}
        success={alertConfig.success}
        message={alertConfig.message}
        onClose={() => setAlertConfig((p) => ({ ...p, open: false }))}
      />
    </div>
  )
}