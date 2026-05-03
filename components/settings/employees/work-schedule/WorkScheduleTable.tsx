"use client"

import React, { useState } from 'react'
import { WorkSchedule } from "@prisma/client"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { TablePagination } from "@/components/data-table/table-pagination"
import { useDataTable } from "@/hooks/use-data-table"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ShieldAlert, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  data: WorkSchedule[]
  isPending: boolean
  onEdit: (schedule: WorkSchedule) => void
  onDelete: (id: string | string[]) => void
}

const VIBRANT_COLORS = ["#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]

export function WorkScheduleTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<WorkSchedule, "shiftName">({ 
      data: data, 
      searchKey: "shiftName", 
      initialSortKey: "shiftName",
  })

  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(item => item.id))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleBulkDelete = () => {
    onDelete(selectedIds)
    setSelectedIds([])
  }

  return (
    <div className="w-full space-y-4 text-left font-poppins">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} schedules selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-sm shadow-none text-[12px] font-semibold"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <TableContainer>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px] px-6 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader label="Shift Name" onClick={() => toggleSort("shiftName")} className="w-[40%]" />
              <TableSortHeader label="Working Hours" className="w-[25%]" />
              <TableSortHeader label="Grace Period" className="w-[20%]" />
              <TableSortHeader label="Action" isAction className="w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableLoader colSpan={5} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState colSpan={5} message="No schedules found" description="Create a new work schedule." />
            ) : (
              paginatedData.map((schedule, index) => (
                <TableRow 
                  key={schedule.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(schedule.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(schedule.id)}
                      onChange={(e) => handleSelectRow(schedule.id, e.target.checked)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <Badge
                      className="border-none px-3 py-1 rounded-full font-semibold text-[10px] uppercase shadow-none"
                      style={{
                        backgroundColor: `${VIBRANT_COLORS[index % VIBRANT_COLORS.length]}15`,
                        color: VIBRANT_COLORS[index % VIBRANT_COLORS.length]
                      }}
                    >
                      {schedule.shiftName}
                    </Badge>
                  </TableData>

                  <TableData variant="secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {schedule.checkInTime} - {schedule.checkOutTime}
                    </div>
                  </TableData>

                  <TableData variant="secondary">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-slate-500 text-[12px]">
                        {schedule.gracePeriod} Mins
                      </span>
                    </div>
                  </TableData>

                  <TableData variant="action">
                    <TableRowActions 
                      onEdit={() => onEdit(schedule)} 
                      onDelete={() => onDelete(schedule.id)} 
                    />
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!isPending && data.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  )
}