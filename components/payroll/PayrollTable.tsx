"use client"

import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableContainer } from "@/components/data-table/table-container"
import { TableData } from "@/components/data-table/table-data"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { FlattenedPayroll } from "@/types/payroll"
import { PayrollRowActions } from "./PayrollRowActions"
import { PayrollStatus } from "@prisma/client"
import { AlertCircle } from "lucide-react"

interface PayrollTableProps {
  data: FlattenedPayroll[]
  toggleSort: (key: keyof FlattenedPayroll) => void
  onView: (item: FlattenedPayroll) => void
  onEdit: (item: FlattenedPayroll) => void
  onDelete: (id: string) => void
  selectedIds: string[]
  onSelect: (ids: string[]) => void
}

export function PayrollTable({ 
  data, 
  toggleSort, 
  onView,
  onEdit, 
  onDelete, 
  selectedIds, 
  onSelect 
}: PayrollTableProps) {
  
  const selectableData = data.filter(item => item.status !== PayrollStatus.PAID);
  const isAllSelected = selectableData.length > 0 && selectedIds.length === selectableData.length;

  const getStatusColor = (status: PayrollStatus) => {
    const s = status.toLowerCase()
    if (s === 'paid') return "bg-emerald-50 text-emerald-700 border-emerald-100"
    if (s === 'pending') return "bg-amber-50 text-amber-700 border-amber-100"
    if (s === 'approved') return "bg-blue-50 text-blue-700 border-blue-100"
    return "bg-slate-50 text-slate-700 border-slate-100"
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelect([]);
    } else {
      onSelect(selectableData.map(item => item.id));
    }
  }

  return (
    <div className="w-full space-y-5 text-left font-poppins">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableSortHeader label="" className="w-[40px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </TableSortHeader>
              <TableSortHeader label="Employee" onClick={() => toggleSort("employeeName")} />
              <TableSortHeader label="Base Salary" onClick={() => toggleSort("basicSalary")} />
              <TableSortHeader label="Overtime" onClick={() => toggleSort("totalOvertime")} />
              <TableSortHeader label="Net Salary" onClick={() => toggleSort("netSalary")} />
              <TableSortHeader label="Status" className="w-[120px]" />
              <TableSortHeader label="Action" isAction className="w-[150px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableEmptyState colSpan={7} message="No payroll records found" description="Adjust your filters or generate new payroll" />
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className={cn("group transition-colors", item.isAnomaly ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50/50")}>
                  <TableData>
                    <input
                      type="checkbox"
                      disabled={item.status === PayrollStatus.PAID}
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelect([...selectedIds, item.id])
                        } else {
                          onSelect(selectedIds.filter((id) => id !== item.id))
                        }
                      }}
                      className="cursor-pointer disabled:cursor-not-allowed opacity-70"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <div className="flex items-center gap-2">
                      {item.employeeName}
                      {item.isAnomaly && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      )}
                    </div>
                  </TableData>
                  <TableData variant="secondary">IDR {item.basicSalary.toLocaleString()}</TableData>
                  <TableData variant="secondary">IDR {item.totalOvertime.toLocaleString()}</TableData>
                  <TableData variant="secondary">IDR {item.netSalary.toLocaleString()}</TableData>

                  <TableData>
                    <Badge variant="outline" className={cn("font-semibold text-[10px] px-3 py-1 rounded-full shadow-none font-poppins", getStatusColor(item.status))}>
                      {item.status}
                    </Badge>
                  </TableData>

                  <TableData variant="action">
                    <div className="flex items-center justify-end gap-2">
                      <PayrollRowActions id={item.id} status={item.status} />
                      
                      <TableRowActions 
                        onView={() => onView(item)}
                        onEdit={() => onEdit(item)} 
                        onDelete={() => onDelete(item.id)}
                        editDisabled={item.status === "PAID" || item.status === "APPROVED"}
                        deleteDisabled={item.status === "PAID" || item.status === "APPROVED"}
                      />
                    </div>
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}