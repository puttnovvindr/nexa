"use client"

import React, { useState } from "react"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TablePagination } from "@/components/data-table/table-pagination"
import { useDataTable } from "@/hooks/use-data-table"
import { CheckCircle, XCircle, Tag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalculationBase } from "@prisma/client"
import { SerializedComponentMaster } from "@/types/payroll"

const BASE_LABELS: Record<CalculationBase, string> = {
  FIXED: "Fixed",
  PERCENT_BASE: "% Base",
  PERCENT_GROSS: "% Gross",
  ATTENDANCE_DAYS: "× Work Days",
  WORK_HOURS: "× Work Hours",
  OVERTIME_HOURS: "× OT Hours",
  PERCENT_TOTAL_EARNINGS: "% Total Earn",
  PERCENT_GROSS_TAXABLE: "% of Total Taxable Earnings",
  FORMULA: "Formula",
  LATE_COUNT: "× Late Count",
  LATE_MINUTES: "× Late Minutes",
}

const BASE_COLORS: Record<CalculationBase, string> = {
  FIXED: "bg-slate-100 text-slate-600 border-slate-200",
  PERCENT_BASE: "bg-blue-50 text-blue-700 border-blue-100",
  PERCENT_GROSS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  ATTENDANCE_DAYS: "bg-emerald-50 text-emerald-700 border-emerald-100",
  WORK_HOURS: "bg-amber-50 text-amber-700 border-amber-100",
  OVERTIME_HOURS: "bg-orange-50 text-orange-700 border-orange-100",
  PERCENT_TOTAL_EARNINGS: "bg-violet-50 text-violet-700 border-violet-100",
  PERCENT_GROSS_TAXABLE: "bg-red-50 text-violet-700 border-violet-100",
  FORMULA: "bg-rose-50 text-rose-700 border-rose-100",
  LATE_COUNT: "bg-red-50 text-red-700 border-red-100",
  LATE_MINUTES: "bg-yellow-50 text-yellow-700 border-yellow-100",
}

interface Props {
  data: SerializedComponentMaster[]
  isPending: boolean
  onToggleSort: (key: string) => void
  onEdit: (item: SerializedComponentMaster) => void
  onDelete: (id: string | string[]) => void
}

type ComponentSortKey = keyof Pick<SerializedComponentMaster, "name" | "category" | "base" | "groupName">

export function MasterComponentTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<SerializedComponentMaster, ComponentSortKey>({ 
      data, 
      searchKey: "name", 
      initialSortKey: "name",
  })

  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map((item) => item.id))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const handleBulkDelete = () => {
    onDelete(selectedIds)
    setSelectedIds([])
  }

  return (
    <div className="w-full space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} components selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-sm shadow-none text-[12px] font-semibold"
            onClick={handleBulkDelete}
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
            <TableRow className="bg-white hover:bg-white border-b border-slate-300">
              <TableHead className="w-[50px] px-6 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader
                label="Component Name"
                onClick={() => toggleSort("name")}
                className="w-[20%]"
              />
              <TableSortHeader label="Group" className="w-[12%]" />
              <TableSortHeader label="Type" className="w-[10%]" />
              <TableSortHeader label="Calc. Base" className="w-[12%]" />
              <TableSortHeader label="Default Value" className="w-[15%]" />
              <TableSortHeader label="Taxable" className="w-[8%]" />
              <TableSortHeader label="Deduction" className="w-[10%]" />
              <TableSortHeader label="Assigned" className="w-[10%]" />
              <TableSortHeader label="Action" isAction className="w-[100px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableLoader colSpan={10} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={10}
                message="No components found"
                description="Try adding a new payroll component to get started."
              />
            ) : (
              paginatedData.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                
                return (
                  <TableRow 
                    key={item.id}
                    className={cn(
                      "group transition-all duration-200 border-b border-slate-300 hover:bg-slate-50/50",
                      isSelected && "bg-purple-50/30 hover:bg-purple-50/50"
                    )}
                  >
                    <TableData variant="list" className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                        className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                      />
                    </TableData>

                    <TableData variant="primary">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    </TableData>
                    
                    <TableData>
                      {item.groupName ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[12px] font-semibold text-slate-600 uppercase truncate">
                            {item.groupName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </TableData>

                    <TableData variant="list">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold border px-3 py-1 uppercase",
                          item.category === "EARNING"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        )}
                      >
                        {item.category}
                      </Badge>
                    </TableData>

                    <TableData>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-semibold px-3 py-1 rounded-full uppercase whitespace-nowrap", BASE_COLORS[item.base])}
                      >
                        {BASE_LABELS[item.base]}
                      </Badge>
                    </TableData>

                    <TableData variant="secondary" className="font-bold">
                      {item.base === "PERCENT_BASE" ||
                      item.base === "PERCENT_GROSS" ||
                      item.base === "PERCENT_TOTAL_EARNINGS"
                        ? `${item.defaultAmount}%`
                        : `IDR ${Number(item.defaultAmount).toLocaleString()}`}
                    </TableData>

                    <TableData>
                      {item.isTaxable ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </TableData>

                    <TableData variant="list">
                      {item.category === "DEDUCTION" && item.deductionType ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold px-3 py-1 rounded-full uppercase",
                            item.deductionType === "PRE_TAX"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {item.deductionType === "PRE_TAX" ? "Pre-Tax" : "Post-Tax"}
                        </Badge>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </TableData>

                    <TableData variant="secondary">
                      <span className="text-[12px] font-bold text-slate-500 whitespace-nowrap">
                        {item._count.configs} emp.
                      </span>
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
                )
              })
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