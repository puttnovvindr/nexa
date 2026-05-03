"use client"

import React, { useState, useMemo, useTransition } from 'react'
import { useRouter } from "next/navigation"
import { useDataTable } from "@/hooks/use-data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableContainer } from "@/components/data-table/table-container"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Leave, LeaveStatus, LeaveType } from "@/types/leave"
import { updateLeaveStatus } from "@/actions/leave-actions"

interface LeaveTableProps {
  data: Leave[]
  search: string
  selectedStatus: string[]
  onEdit: (item: Leave) => void
  onDelete: (id: string) => void
}

interface FlattenedLeave extends Omit<Leave, 'startDate' | 'endDate'> {
  typeName: string
  startDate: string
  endDate: string
  [key: string]: string | number | boolean | LeaveType | null | undefined | Date
}

type LeaveSortKey = "employeeName" | "typeName" | "startDate" | "status"

export default function LeaveTable({ 
  data, 
  search, 
  selectedStatus,
  onEdit,
  onDelete 
}: LeaveTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const filteredAndFlattenedData = useMemo(() => {
    return data
      .filter((item: Leave) => {
        const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(item.status)
        return matchesStatus
      })
      .map((item: Leave): FlattenedLeave => ({
        ...item,
        typeName: item.leaveType.name,
        startDate: item.startDate instanceof Date ? item.startDate.toISOString().split('T')[0] : String(item.startDate),
        endDate: item.endDate instanceof Date ? item.endDate.toISOString().split('T')[0] : String(item.endDate),
      }))
  }, [data, selectedStatus])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<FlattenedLeave, LeaveSortKey>({ 
      data: filteredAndFlattenedData, 
      searchKey: "employeeName", 
      initialSortKey: "employeeName",
      externalSearch: search, 
  })

  const handleUpdateStatus = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      try {
        const res = await updateLeaveStatus({ id, status })
        if (res.success) {
          setAlertConfig({ open: true, success: true, message: `Leave ${status.toLowerCase()} successfully!` })
          router.refresh()
        } else {
          setAlertConfig({ open: true, success: false, message: res.message || "Failed to update status" })
        }
      } catch {
        setAlertConfig({ open: true, success: false, message: "Something went wrong" })
      }
    })
  }

  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length
  
  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds([])
    else setSelectedIds(paginatedData.map(leave => leave.id))
  }

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "REJECTED": return "bg-red-50 text-red-700 border-red-100"
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100"
      default: return "bg-slate-50 text-slate-700 border-slate-100"
    }
  }

  return (
    <div className="w-full space-y-5 text-left font-poppins">
      
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} requests selected
          </span>
          <Button 
            variant="destructive" size="sm" className="rounded-sm text-[12px] font-semibold"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] px-6 text-center">
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="cursor-pointer" />
              </TableHead>
              <TableSortHeader label="Employee" onClick={() => toggleSort("employeeName")} className="w-[200px]" />
              <TableSortHeader label="Leave Type" onClick={() => toggleSort("typeName")} className="w-[150px]" />
              <TableSortHeader label="Duration" className="w-[120px]" />
              <TableSortHeader label="Date Range" onClick={() => toggleSort("startDate")} className="w-[200px]" />
              <TableSortHeader label="Status" onClick={() => toggleSort("status")} className="w-[120px]" />
              <TableSortHeader label="Action" isAction className="w-[180px]" />
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState colSpan={7} message="No leave requests found" />
            ) : (
              paginatedData.map((leave) => (
                <TableRow key={leave.id} className={cn("group hover:bg-slate-50/50", selectedIds.includes(leave.id) && "bg-purple-50/30")}>
                  <TableData className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(leave.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(prev => [...prev, leave.id])
                        else setSelectedIds(prev => prev.filter(id => id !== leave.id))
                      }}
                      className="cursor-pointer"
                    />
                  </TableData>
                  
                  <TableData variant="primary">{leave.employeeName}</TableData>
                  <TableData variant="secondary">{leave.typeName}</TableData>
                  <TableData variant="secondary" className="font-semibold">{leave.duration} Days</TableData>
                  <TableData variant="secondary" className="text-xs">{leave.startDate} - {leave.endDate}</TableData>

                  <TableData>
                    <Badge variant="outline" className={cn("font-semibold text-[10px] px-3 py-1 uppercase rounded-full shadow-none", getStatusColor(leave.status))}>
                      {leave.status}
                    </Badge>
                  </TableData>

                  <TableData variant="action">
                    <div className="flex items-center justify-end gap-2">
                      {leave.status === "PENDING" && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                            onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                            disabled={isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                            disabled={isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <TableRowActions 
                        onEdit={() => onEdit(leave)} 
                        onDelete={() => onDelete(leave.id)}
                        editDisabled={leave.status !== "PENDING"}
                        deleteDisabled={leave.status !== "PENDING"}
                      />
                    </div>
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <DeleteConfirm 
        open={!!deleteId || bulkDeleteConfirm} 
        onOpenChange={(v) => { if(!v) { setDeleteId(null); setBulkDeleteConfirm(false); } }} 
        isPending={isPending} 
        onConfirm={() => {
          const ids = deleteId ? [deleteId] : selectedIds
          onDelete(ids[0]) 
        }} 
      />
      
      <StatusDialog 
        open={alertConfig.open} 
        success={alertConfig.success} 
        message={alertConfig.message} 
        onClose={() => setAlertConfig(p => ({ ...p, open: false }))} 
      />
    </div>
  )
}