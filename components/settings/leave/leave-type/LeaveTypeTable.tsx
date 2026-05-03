"use client"

import React, { useState, useMemo } from "react"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Trash2, FileUp } from "lucide-react"

import { useDataTable } from "@/hooks/use-data-table"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableContainer } from "@/components/data-table/table-container"
import { TableData } from "@/components/data-table/table-data"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TablePagination } from "@/components/data-table/table-pagination"
import { Button } from "@/components/ui/button"

import { LeaveType } from "@/types/leave"

interface Props {
  data: LeaveType[]
  isPending: boolean
  onEdit: (item: LeaveType) => void
  onDelete: (id: string | string[]) => void
}

type FlattenedLeaveType = LeaveType & {
  [key: string]: unknown 
}

type LeaveSortKey = "name" | "category" | "defaultQuota" | "durationType"

export function LeaveTypeTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const flattenedData = useMemo(() => {
    return data.map((item): FlattenedLeaveType => ({
      ...item,
    }))
  }, [data])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<FlattenedLeaveType, LeaveSortKey>({ 
      data: flattenedData, 
      searchKey: "name", 
      initialSortKey: "name",
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

  const getCategoryColor = (category: string) => {
    const c = category.toUpperCase()
    if (c === 'PAID') return "bg-emerald-50 text-emerald-700 border-emerald-100"
    if (c === 'SICK') return "bg-rose-50 text-rose-700 border-rose-100"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <div className="w-full space-y-5 text-left font-poppins">
      
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} items selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-sm shadow-none text-[12px] font-semibold"
            onClick={() => onDelete(selectedIds)}
            disabled={isPending}
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
              <TableHead className="w-[48px] px-4 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader label="Leave Name" onClick={() => toggleSort("name")} className="w-[20%]" />
              <TableSortHeader label="Category" onClick={() => toggleSort("category")} className="w-[15%]" />
              <TableSortHeader label="Duration" onClick={() => toggleSort("durationType")} className="w-[15%]" />
              <TableSortHeader label="Quota" onClick={() => toggleSort("defaultQuota")} className="text-center w-[12%]" />
              <TableSortHeader label="Attachment" className="w-[20%]" />
              <TableSortHeader label="Action" isAction className="w-[100px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState colSpan={7} message="No leave types found" description="Try to adjust your search or add new policy" />
            ) : (
              paginatedData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(item.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-bold text-slate-700" title={item.name}>{item.name}</span>
                    </div>
                  </TableData>

                  <TableData>
                    <Badge variant="outline" className={cn("font-semibold text-[11px] px-3 py-1 uppercase rounded-full shadow-none whitespace-nowrap", getCategoryColor(item.category))}>
                      {item.category}
                    </Badge>
                  </TableData>

                  <TableData>
                    <Badge variant="outline" className="font-semibold text-[11px] px-3 py-1 uppercase rounded-full shadow-none whitespace-nowrap bg-slate-100 text-slate-700 border-slate-200">
                      {item.durationType}
                    </Badge>
                  </TableData>

                  <TableData variant="secondary">
                     <span className="block truncate">
                      {item.defaultQuota} Days
                    </span>
                  </TableData>

                  <TableData>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!item.requiresAttachment}
                      onClick={() => alert("To be continued...")}
                      className={cn(
                        "h-8 px-3 text-[10px] font-semibol rounded-sm shadow-none flex items-center gap-2 cursor-pointer",
                        item.requiresAttachment 
                          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700" 
                          : "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                      )}
                    >
                      <FileUp size={14} />
                      {item.requiresAttachment ? "Upload Proof" : "No Proof Req."}
                    </Button>
                  </TableData>

                  <TableData variant="action">
                    <TableRowActions 
                      onEdit={() => onEdit(item)} 
                      onDelete={() => onDelete(item.id)}
                      editDisabled={isPending}
                      deleteDisabled={isPending}
                    />
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
    </div>
  )
}