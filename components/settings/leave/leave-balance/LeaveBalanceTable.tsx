"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableContainer } from "@/components/data-table/table-container"
import { TableData } from "@/components/data-table/table-data"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TablePagination } from "@/components/data-table/table-pagination"
import { useDataTable } from "@/hooks/use-data-table"
import { LeaveBalance } from "@/types/leave"

interface Props {
  data: LeaveBalance[]
  isPending: boolean
  onEdit: (item: LeaveBalance) => void
  onDelete: (id: string | string[]) => void
}

type DataTableLeaveBalance = LeaveBalance & { [key: string]: unknown }

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";

  try {
    const dateStr = typeof value === "object" && value instanceof Date 
      ? value.toISOString() 
      : String(value);
    const [datePart] = dateStr.split("T");
    const [year, month, day] = datePart.split("-");
    
    if (!year || !month || !day) return "—";

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  } catch (e) {
    return "—";
  }
}

type UsageStatus = "ok" | "warn" | "critical"

function getUsageStatus(remaining: number, entitlement: number): UsageStatus {
  if (entitlement === 0) return "ok"
  const ratio = remaining / entitlement
  if (remaining <= 2 || ratio <= 0.1) return "critical"
  if (ratio <= 0.3) return "warn"
  return "ok"
}

const USAGE_PROGRESS_CLASS: Record<UsageStatus, string> = {
  ok: "[&>div]:bg-emerald-500",
  warn: "[&>div]:bg-amber-400",
  critical: "[&>div]:bg-rose-500",
}

const USAGE_REMAINING_CLASS: Record<UsageStatus, string> = {
  ok: "text-slate-500",
  warn: "text-amber-600",
  critical: "text-rose-600",
}

export function LeaveBalanceTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { 
    paginatedData, 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    toggleSort 
  } = useDataTable<DataTableLeaveBalance, string>({
    data: data as DataTableLeaveBalance[],
    searchKey: "id",
    initialSortKey: "year",
  })

  const isAllSelected = data.length > 0 && selectedIds.length === data.length

  const toggleAll = () => {
  if (isAllSelected) {
    setSelectedIds([])
  } else {
    const allIds = data.map((item) => item.id)
    setSelectedIds(allIds)
  }
}

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const handleBulkDelete = () => {
    onDelete(selectedIds)
    setSelectedIds([])
  }

  return (
    <div className="w-full space-y-4 font-poppins text-left">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-100 px-4 py-2.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[12px] font-semibold text-violet-700">
            {selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-lg shadow-none text-[12px] font-semibold h-8"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete selected
          </Button>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px] px-5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-violet-600 cursor-pointer"
                />
              </TableHead>
              <TableSortHeader label="Employee" onClick={() => toggleSort("employeeId")} />
              <TableSortHeader label="Type" className="w-[140px]" onClick={() => toggleSort("leaveTypeId")}/>
              <TableSortHeader label="From" className="w-[140px]" onClick={() => toggleSort("validFrom")}/>
              <TableSortHeader label="To" className="w-[140px]" onClick={() => toggleSort("validTo")}/>
              <TableSortHeader label="Usage (Taken / Total)" className="w-[240px]" onClick={() => toggleSort("remaining")}/>
              <TableSortHeader label="Action" isAction className="w-[90px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={8}
                message="No balance records found"
                description="Assign leave entitlements to employees to see usage tracking"
              />
            ) : (
              paginatedData.map((item) => {
                const usagePct =
                  item.entitlement > 0
                    ? Math.min(
                        Math.round((item.taken / item.entitlement) * 100),
                        100
                      )
                    : 0
                const status = getUsageStatus(item.remaining, item.entitlement)
                const isSelected = selectedIds.includes(item.id)

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "group transition-colors hover:bg-slate-50/60",
                      isSelected && "bg-violet-50/40 hover:bg-violet-50/60"
                    )}
                  >
                    <TableData className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleRow(item.id, e.target.checked)}
                        className="w-3.5 h-3.5 accent-violet-600 cursor-pointer"
                      />
                    </TableData>

                    <TableData variant="primary">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-slate-800 leading-none">
                          {item.employee.fullName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {item.employee.employeeId}
                        </span>
                      </div>
                    </TableData>

                    <TableData>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        {item.leaveType.name}
                      </span>
                    </TableData>

                    <TableData>
                      <span className="text-[12px] font-medium text-slate-600">
                        {formatDate(item.validFrom)}
                      </span>
                    </TableData>
                    
                    <TableData>
                      <span className="text-[12px] font-medium text-slate-600">
                        {formatDate(item.validTo)}
                      </span>
                    </TableData>

                    <TableData>
                      <div className="flex flex-col gap-1.5 py-0.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[11px] uppercase",
                              USAGE_REMAINING_CLASS[status]
                            )}
                          >
                            Remaining: {item.remaining}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {item.taken} / {item.entitlement} days
                          </span>
                        </div>
                        <Progress
                          value={usagePct}
                          className={cn(
                            "h-1.5 bg-slate-100",
                            USAGE_PROGRESS_CLASS[status]
                          )}
                        />
                      </div>
                    </TableData>

                    <TableData variant="action">
                      <div className="flex items-center justify-end">
                        <TableRowActions
                          onEdit={() => onEdit(item)}
                          onDelete={() => onDelete(item.id)}
                          editDisabled={isPending}
                          deleteDisabled={isPending}
                        />
                      </div>
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