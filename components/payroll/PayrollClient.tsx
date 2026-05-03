"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  updateSalaryConfig,
  deletePayroll,
  updatePayrollStatus,
} from "@/actions/payroll-actions"
import { PayrollTableProps, FlattenedPayroll, SerializedPayroll } from "@/types/payroll"
import { useDataTable } from "@/hooks/use-data-table"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { TableSearch } from "@/components/data-table/table-search"
import { TableFilter } from "@/components/data-table/table-filter"
import { TablePagination } from "@/components/data-table/table-pagination"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { PayrollStatus, EmploymentBasis } from "@prisma/client"

import { PayrollTable } from "./PayrollTable"
import { PayrollStats } from "./PayrollStats"
import { PayrollBulkActions } from "./PayrollBulkActions"
import PayrollImportModal from "./PayrollImportModal"
import { PayrollDetailSheet } from "./PayrollDetailSheet"

const ANOMALY_THRESHOLD = {
  OVERTIME_RATIO: 0.3,
  MIN_NET_RATIO: 0.5,
}

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  label: new Date(0, i).toLocaleString("en", { month: "long" }),
}))

const yearOptions = ["2024", "2025", "2026"].map((y) => ({
  id: y,
  label: y,
}))

function deriveComponentTotals(payroll: SerializedPayroll) {
  const earnings = payroll.components.filter((c) => c.category === "EARNING")
  const deductions = payroll.components.filter((c) => c.category === "DEDUCTION")

  const totalEarnings = earnings.reduce((acc, c) => acc + Number(c.amount), 0)
  const totalDeductions = deductions.reduce((acc, c) => acc + Number(c.amount), 0)

  const basicSalary = Number(payroll.baseRateSnapshot)
  const totalOvertime = earnings
    .filter((c) => c.name.toLowerCase().includes("overtime") || c.name.toLowerCase().includes("lembur"))
    .reduce((acc, c) => acc + Number(c.amount), 0)
  const totalAllowance = earnings
    .filter((c) => !c.name.toLowerCase().includes("overtime") && !c.name.toLowerCase().includes("lembur"))
    .reduce((acc, c) => acc + Number(c.amount), 0)
  const totalDeduction = totalDeductions

  return { basicSalary, totalOvertime, totalAllowance, totalDeduction }
}

export default function PayrollClient({ data }: PayrollTableProps) {
  const router = useRouter()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState<FlattenedPayroll | null>(null)
  const [viewingPayroll, setViewingPayroll] = useState<FlattenedPayroll | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [month, setMonth] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const flattenedData = useMemo((): FlattenedPayroll[] =>
    data.map((item) => {
      const { basicSalary, totalOvertime, totalAllowance, totalDeduction } =
        deriveComponentTotals(item)

      const overtimeRatio = basicSalary > 0 ? totalOvertime / basicSalary : 0
      const netRatio = basicSalary > 0 ? Number(item.netSalary) / basicSalary : 1
      const isAnomaly =
        overtimeRatio > ANOMALY_THRESHOLD.OVERTIME_RATIO ||
        netRatio < ANOMALY_THRESHOLD.MIN_NET_RATIO

      return {
        ...item,
        employeeName: item.employee.fullName,
        jobTitle: item.employee.job?.jobTitle ?? "",
        departmentName: item.employee.job?.orgUnit?.name ?? "",
        isAnomaly,
        basicSalary,
        totalOvertime,
        totalAllowance,
        totalDeduction,
      }
    }),
    [data]
  )

  const stats = useMemo(
    () => ({
      total: flattenedData.length,
      paid: flattenedData.filter((d) => d.status === PayrollStatus.PAID).length,
      pending: flattenedData.filter((d) => d.status === PayrollStatus.PENDING).length,
      approved: flattenedData.filter((d) => d.status === PayrollStatus.APPROVED).length,
      draft: flattenedData.filter((d) => d.status === PayrollStatus.DRAFT).length,
      anomalies: flattenedData.filter((d) => d.isAnomaly).length,
    }),
    [flattenedData]
  )

  const filteredData = useMemo(
    () =>
      flattenedData.filter(
        (item) =>
          (selectedStatus.length === 0 || selectedStatus.includes(item.status)) &&
          item.employeeName.toLowerCase().includes(search.toLowerCase()) &&
          (!month || item.month === Number(month)) &&
          (!year || item.year === Number(year))
      ),
    [flattenedData, selectedStatus, search, month, year]
  )

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } =
    useDataTable<FlattenedPayroll, keyof FlattenedPayroll>({
      data: filteredData,
      searchKey: "employeeName",
      initialSortKey: "employeeName",
    })

  const handleUpdateConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const res = await updateSalaryConfig(new FormData(e.currentTarget))
      if (res.success) {
        setAlertConfig({ open: true, success: true, message: "Salary config updated successfully!" })
        setEditingConfig(null)
        router.refresh()
      } else {
        throw new Error(res.error || "Update failed")
      }
    } catch (err) {
      setAlertConfig({
        open: true,
        success: false,
        message: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsPending(true)
    try {
      const result = await deletePayroll(deleteId)
      if (result.success) {
        setAlertConfig({ open: true, success: true, message: "Record deleted successfully!" })
        setDeleteId(null)
        router.refresh()
      }
    } catch {
      setAlertConfig({ open: true, success: false, message: "Failed to delete record" })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col font-poppins overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden gap-6">

        <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 shadow-lg shadow-purple-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-5 -mt-5" />
          <div className="relative z-10 flex items-center">
            <div className="flex flex-col">
              <h1 className="text-[16px] font-bold tracking-tight text-white uppercase">Payroll Management</h1>
              <p className="text-white/80 text-[12px] font-medium leading-tight mt-0.5">
                Manage salary, payment status, and payroll insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          <div className="flex-1 min-w-0 flex flex-col space-y-6 overflow-hidden">

            <div className="shrink-0 space-y-4">
              <PayrollStats {...stats} />
              <div className="flex items-center justify-between gap-4">
                <PayrollBulkActions
                  selectedIds={selectedIds}
                  onClear={() => setSelectedIds([])}
                  allData={flattenedData}
                  onSelect={setSelectedIds}
                />
              </div>
            </div>

            <div className="flex w-full justify-between items-center gap-4 shrink-0">
              <TableSearch value={search} onChange={setSearch} placeholder="Search employee..." />

              <div className="flex items-center gap-3">
                <TableFilter
                  categories={[
                    {
                      id: "month",
                      label: "Month",
                      options: monthOptions,
                      selectedValues: month ? [month] : [],
                      onUpdate: (v) => setMonth(v.length > 0 ? v[v.length - 1] : ""),
                      hideSearch: true,
                      hideFooter: true,
                      className: "w-44",
                    },
                    {
                      id: "year",
                      label: "Year",
                      options: yearOptions,
                      selectedValues: year ? [year] : [],
                      onUpdate: (v) => setYear(v.length > 0 ? v[v.length - 1] : ""),
                      hideSearch: true,
                      hideFooter: true,
                      className: "w-32",
                    },
                    {
                      id: "status",
                      label: "Status",
                      options: Object.values(PayrollStatus).map((s) => ({ id: s, label: s })),
                      selectedValues: selectedStatus,
                      onUpdate: setSelectedStatus,
                    },
                  ]}
                />

                <Link href="/payroll/settings">
                  <Button
                    variant="outline"
                    className="h-10 px-4 rounded-md border-gray-200 text-gray-500 hover:text-[#7C3AED] hover:bg-purple-50 transition-all font-semibold text-[12px] gap-2 cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>

                <PayrollImportModal onSuccess={(s) => setSelectedStatus([s])} />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              <PayrollTable
                data={paginatedData}
                toggleSort={toggleSort}
                onView={(item) => setViewingPayroll(item)}
                onEdit={(item) => setEditingConfig(item)}
                onDelete={(id) => setDeleteId(id)}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
              />
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <EntryDialog
          open={!!editingConfig}
          onOpenChange={(v) => !v && setEditingConfig(null)}
          title="Edit Salary Configuration"
          onSubmit={handleUpdateConfig}
          isPending={isPending}
        >
          <div className="space-y-6">
            <input type="hidden" name="employeeId" value={editingConfig?.employee.employeeId || ""} />

            <div className="flex flex-col gap-1 px-1 py-2 border-b border-slate-100 mb-4 font-poppins">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                  {editingConfig?.employeeName}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  Period {editingConfig?.month}/{editingConfig?.year}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium italic">
                Update salary configuration for this employee
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Employment Basis"
                name="basis"
                defaultValue={editingConfig?.employee.salaryConfig?.basis || "MONTHLY"}
                options={[
                  { label: "Monthly", value: EmploymentBasis.MONTHLY },
                  { label: "Daily", value: EmploymentBasis.DAILY },
                  { label: "Hourly", value: EmploymentBasis.HOURLY },
                  { label: "Weekly", value: EmploymentBasis.WEEKLY },
                ]}
                required
              />
              <FormInput
                label="Base Rate"
                name="baseRate"
                type="number"
                defaultValue={editingConfig?.employee.salaryConfig?.baseRate ?? editingConfig?.baseRateSnapshot}
                required
              />
            </div>
          </div>
        </EntryDialog>

        <DeleteConfirm
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          isPending={isPending}
          onConfirm={handleDelete}
        />

        <PayrollDetailSheet
          payroll={viewingPayroll}
          open={!!viewingPayroll}
          onOpenChange={(v) => !v && setViewingPayroll(null)}
        />

        <StatusDialog
          open={alertConfig.open}
          success={alertConfig.success}
          message={alertConfig.message}
          onClose={() => setAlertConfig((p) => ({ ...p, open: false }))}
        />
      </div>
    </div>
  )
}