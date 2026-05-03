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
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { EmploymentBasis } from "@prisma/client"
import { SerializedSalaryConfig, SerializedComponentMaster } from "@/types/payroll"

const BASIS_LABELS: Record<EmploymentBasis, string> = {
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  DAILY: "Daily",
  HOURLY: "Hourly",
}

interface Props {
  data: SerializedSalaryConfig[]
  isPending: boolean
  onToggleSort: (key: string) => void
  onEdit: (config: SerializedSalaryConfig) => void
  onDelete: (id: string | string[]) => void
  masters: SerializedComponentMaster[]
  onAssign: (configId: string, masterId: string, amount: number | null) => void
  onRemoveComponent: (configId: string, masterId: string) => void
}

type SalarySortKey = "fullName" | "employeeId" | "baseRate"

export function SalaryConfigTable({
  data,
  isPending,
  onEdit,
  onDelete,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<SerializedSalaryConfig, SalarySortKey>({ 
      data, 
      searchKey: "id",
      initialSortKey: "fullName",
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
            {selectedIds.length} salary configurations selected
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
              <TableHead className="w-[48px] px-6 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader 
                label="Employee" 
                onClick={() => toggleSort("fullName")} 
                className="w-[25%]" 
              />
              <TableSortHeader label="Basis" className="w-[10%]" />
              <TableSortHeader label="Base Rate" className="w-[15%]" />
              <TableSortHeader label="Active Components" className="w-[35%]" />
              <TableSortHeader label="Action" isAction className="w-[100px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableLoader colSpan={6} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                message="No salary configurations found"
                description="Try adding a new configuration or adjust your search."
              />
            ) : (
              paginatedData.map((config) => {
                const isSelected = selectedIds.includes(config.id)

                return (
                  <TableRow 
                    key={config.id} 
                    className={cn(
                      "group transition-all duration-200 border-b border-slate-300 hover:bg-slate-50/50",
                      isSelected && "bg-purple-50/30 hover:bg-purple-50/50"
                    )}
                  >
                    <TableData className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(config.id, e.target.checked)}
                        className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                      />
                    </TableData>

                    <TableData variant="primary">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-semibold truncate" title={config.employee.fullName}>
                          {config.employee.fullName}
                        </span>
                        <span className="text-[12px] text-slate-400 font-semibold uppercase truncate">
                          {config.employee.employeeId}
                        </span>
                      </div>
                    </TableData>

                    <TableData>
                      <Badge variant="outline" className="text-[10px] px-3 py-1 font-semibold border-slate-300 bg-white shadow-none uppercase">
                        {BASIS_LABELS[config.basis]}
                      </Badge>
                    </TableData>

                    <TableData variant="secondary" className="font-bold">
                      IDR {config.baseRate.toLocaleString()}
                    </TableData>

                    <TableData>
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {config.components.length === 0 ? (
                          <span className="text-[10px] text-slate-300 italic font-medium">No components</span>
                        ) : (
                          config.components.map((c) => (
                            <Badge
                              key={c.id}
                              className={cn(
                                "text-[10px] font-semibold px-3 py-1 border-none shadow-none uppercase whitespace-nowrap",
                                c.master.category === "EARNING" ? "bg-emerald-100/50 text-emerald-700" : "bg-rose-100/50 text-rose-700"
                              )}
                            >
                              {c.master.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableData>

                    <TableData variant="action">
                      <TableRowActions 
                        onEdit={() => onEdit(config)} 
                        onDelete={() => onDelete(config.id)} 
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