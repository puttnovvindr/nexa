"use client"

import React, { useMemo } from "react"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { FlattenedPayroll } from "@/types/payroll"
import { Table, TableBody, TableRow } from "@/components/ui/table"
import { Layers, Loader2, Wallet, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TableContainer } from "@/components/data-table/table-container"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { useDataTable } from "@/hooks/use-data-table"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedData: FlattenedPayroll[]
  onRemove: (id: string) => void
  onConfirm: () => void
  isPending: boolean
}

type PayrollSortKey = "employeeName" | "baseRateSnapshot" | "netSalary"

export function BulkReviewDialog({
  open,
  onOpenChange,
  selectedData,
  onRemove,
  onConfirm,
  isPending,
}: Props) {
  const { paginatedData: sortedData, toggleSort } = useDataTable<FlattenedPayroll, PayrollSortKey>({
    data: selectedData,
    initialSortKey: "employeeName",
    searchKey: "employeeName",
  })

  const totalNet = useMemo(
    () => selectedData.reduce((acc, curr) => acc + Number(curr.netSalary), 0),
    [selectedData]
  )

  const anomalyCount = useMemo(
    () => selectedData.filter((p) => p.isAnomaly).length,
    [selectedData]
  )

  return (
    <EntryDialog
      open={open}
      onOpenChange={onOpenChange}
      showFooter={false}
      className="!max-w-[1100px] max-h-[90vh] h-auto p-8 rounded-[32px] border-none flex flex-col overflow-hidden shadow-none font-poppins"
      title={
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="font-semibold text-[18px] text-slate-900 leading-none tracking-tight">
              Batch Disbursement Review
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              Reviewing {selectedData.length} Detailed Payslips
            </p>
          </div>
        </div>
      }
    >
      <style jsx>{`
        .review-scroll::-webkit-scrollbar { width: 4px; height: 6px; }
        .review-scroll::-webkit-scrollbar-track { background: transparent; }
        .review-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      <div className="mt-2 flex flex-col gap-4 overflow-hidden">
        {anomalyCount > 0 && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center gap-3 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-[10px] text-red-700 font-bold leading-tight uppercase">
              {anomalyCount} Anomalies detected.
            </p>
          </div>
        )}

        <TableContainer>
          <div className="overflow-auto review-scroll max-h-[420px] h-auto">
            <Table className="min-w-[900px]">
              <thead>
                <TableRow>
                  <TableSortHeader
                    label="Employee"
                    onClick={() => toggleSort("employeeName")}
                    className="pl-6"
                  />
                  <TableSortHeader
                    label="Basis"
                    onClick={() => toggleSort("basisSnapshot" as PayrollSortKey)}
                  />
                  <TableSortHeader
                    label="Base Rate"
                    onClick={() => toggleSort("baseRateSnapshot")}
                  />
                  <TableSortHeader label="Earnings" />
                  <TableSortHeader label="Deductions" />
                  <TableSortHeader
                    label="Net Salary"
                    onClick={() => toggleSort("netSalary")}
                  />
                  <TableSortHeader label="" isAction className="pr-6" />
                </TableRow>
              </thead>
              <TableBody>
                {sortedData.map((item) => {
                  const totalEarnings = item.components
                    .filter((c) => c.category === "EARNING")
                    .reduce((acc, c) => acc + Number(c.amount), 0)
                  const totalDeductions = item.components
                    .filter((c) => c.category === "DEDUCTION")
                    .reduce((acc, c) => acc + Number(c.amount), 0)

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "group transition-colors border-b border-slate-50 last:border-0",
                        item.isAnomaly ? "bg-red-50/20" : "hover:bg-slate-50/50"
                      )}
                    >
                      <TableData variant="primary" className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{item.employeeName}</span>
                          <span className="text-[12px] text-slate-400 font-normal">
                            {item.employee.employeeId}
                          </span>
                        </div>
                      </TableData>

                      <TableData variant="secondary">{item.basisSnapshot}</TableData>
                      <TableData variant="secondary">
                        IDR {Number(item.baseRateSnapshot).toLocaleString()}
                      </TableData>
                      <TableData variant="secondary" className="text-emerald-600 font-medium">
                        IDR {(Number(item.baseRateSnapshot) + totalEarnings).toLocaleString()}
                      </TableData>
                      <TableData className="text-rose-500 font-medium">
                        - IDR {totalDeductions.toLocaleString()}
                      </TableData>
                      <TableData variant="secondary" className="font-bold text-slate-900">
                        IDR {Number(item.netSalary).toLocaleString()}
                      </TableData>

                      <TableData variant="action" className="pr-6">
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-50 outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableData>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      </div>

      <div className="mt-6 p-4 bg-violet-700 rounded-xl flex items-center justify-between shrink-0 border border-violet-600 shadow-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-violet-200 uppercase tracking-widest leading-none">
            Batch Net Disbursement
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter leading-none">
              IDR {totalNet.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-violet-100 hover:text-white hover:bg-white/10 font-semibold text-[11px] h-10 px-6 rounded-sm uppercase cursor-pointer"
          >
            Discard
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || selectedData.length === 0}
            className="bg-white text-violet-700 hover:bg-violet-50 rounded-sm px-4 font-semibold text-[11px] h-10 border-none shadow-none cursor-pointer transition-all active:scale-95 uppercase tracking-widest"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-violet-700" />
            ) : (
              `Process ${selectedData.length} Records`
            )}
          </Button>
        </div>
      </div>
    </EntryDialog>
  )
}