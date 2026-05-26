"use client"

import React, { useMemo } from "react"
import { FlattenedPayroll } from "@/types/payroll"
import { cn } from "@/lib/utils"
import { PayrollRowActions } from "./PayrollRowActions"
import {
  ArrowUpCircle, ArrowDownCircle, Wallet, AlertTriangle,
  FileText, Building2, CreditCard, ShieldCheck, X,
  Hash, Clock, CalendarCheck, CheckCircle2, LucideIcon
} from "lucide-react"

interface PayrollDetailSheetProps {
  payroll: FlattenedPayroll | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatIDR = (amount: number | string) =>
  `IDR ${Number(amount).toLocaleString("id-ID")}`

const LineItem = ({
  label, value, sub, negative = false, bold = false, highlight = false
}: {
  label: string; value: string; sub?: string;
  negative?: boolean; bold?: boolean; highlight?: boolean
}) => (
  <div className={cn(
    "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors",
    highlight ? "bg-violet-50 border border-violet-100" : "border-b border-slate-50 last:border-0"
  )}>
    <div>
      <p className={cn("text-[12px] font-medium text-slate-600", bold && "font-semibold text-slate-800")}>{label}</p>
      {sub && <p className="text-[10px] text-slate-400 italic mt-0.5">{sub}</p>}
    </div>
    <p className={cn(
      "text-[13px] font-bold tabular-nums",
      negative ? "text-red-500" : bold ? "text-slate-900" : "text-slate-700",
      highlight && "text-violet-700"
    )}>
      {negative ? "− " : ""}{value}
    </p>
  </div>
)

const MetaChip = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null | undefined }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1">
      <Icon className="w-3 h-3 text-slate-400" />
      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">{label}</span>
    </div>
    <span className="text-[11px] font-semibold text-slate-700">{value || "—"}</span>
  </div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase()
  if (s === "paid") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Paid
    </span>
  )
  if (s === "pending") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
  if (s === "approved") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
      <ShieldCheck className="w-3 h-3" /> Approved
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200">
      {status}
    </span>
  )
}

export function PayrollDetailSheet({ payroll, open, onOpenChange }: PayrollDetailSheetProps) {
  const { totalEarnings, totalDeductions, earningComponents, deductionComponents } = useMemo(() => {
    if (!payroll) return { totalEarnings: 0, totalDeductions: 0, earningComponents: [], deductionComponents: [] }
    const earningComponents = payroll.components.filter(c => c.category === "EARNING")
    const deductionComponents = payroll.components.filter(c => c.category === "DEDUCTION")
    const totalEarnings = Number(payroll.baseRateSnapshot) + earningComponents.reduce((acc, c) => acc + Number(c.amount), 0)
    const totalDeductions = deductionComponents.reduce((acc, c) => acc + Number(c.amount), 0)
    return { totalEarnings, totalDeductions, earningComponents, deductionComponents }
  }, [payroll])

  if (!payroll) return null

  const periodLabel = `${new Date(0, payroll.month - 1).toLocaleString("en", { month: "long" })} ${payroll.year}`

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-40 h-screen bg-slate-900/60 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => onOpenChange(false)}
        />
      )}

      <div className={cn(
        "fixed top-0 right-0 h-full w-[560px] max-w-full z-50 bg-white",
        "border-l border-slate-200 shadow-2xl shadow-slate-900/10",
        "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 leading-none">Official Payslip</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                #{payroll.id.substring(0, 8).toUpperCase()} · {periodLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
        >
          <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-[15px] font-bold text-slate-900">{payroll.employeeName}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">ID · {payroll.employee.employeeId}</p>
            </div>
            <StatusBadge status={payroll.status} />
          </div>

          <div className="grid grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-slate-100">
            <MetaChip icon={ShieldCheck} label="PTKP" value={payroll.employee.salaryConfig?.ptkpStatus} />
            <MetaChip icon={Hash} label="NPWP" value={payroll.employee.taxId} />
            <MetaChip icon={CalendarCheck} label="Period" value={`${payroll.month}/${payroll.year}`} />
            <MetaChip icon={Clock} label="Basis" value={payroll.basisSnapshot} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Bank</p>
                <p className="text-[12px] font-bold text-slate-800">{payroll.employee.bankName || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Account No.</p>
                <p className="text-[12px] font-bold text-slate-800 font-mono">{payroll.employee.bankAccount || "—"}</p>
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {payroll.isAnomaly && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[11px] font-semibold text-red-700">
                Anomaly detected in this payroll record. Please verify the calculation.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Breakdown</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Earnings</span>
            </div>
            <div className="space-y-0.5">
              <LineItem label="Base Rate" value={formatIDR(payroll.baseRateSnapshot)} bold />
              {earningComponents.map((c, i) => (
                <LineItem key={i} label={c.name} value={formatIDR(c.amount)} />
              ))}
              <div className="flex items-center justify-between pt-3 px-3 mt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Income</p>
                <p className="text-[14px] font-extrabold text-emerald-600 tabular-nums">{formatIDR(totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-red-500">Deductions</span>
            </div>
            <div className="space-y-0.5">
              {deductionComponents.length > 0
                ? deductionComponents.map((c, i) => (
                    <LineItem key={i} label={c.name} value={formatIDR(c.amount)} negative />
                  ))
                : <p className="text-[11px] text-slate-400 px-3 italic py-2">No deductions applied.</p>
              }
              <div className="flex items-center justify-between pt-3 px-3 mt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Deductions</p>
                <p className="text-[14px] font-extrabold text-red-500 tabular-nums">− {formatIDR(totalDeductions)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 m-5 mt-0">
          <div className="bg-violet-600 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-violet-300 mb-1">Net Take-Home Pay</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <p className="text-[22px] font-extrabold text-white tracking-tight tabular-nums leading-none">
                  {formatIDR(payroll.netSalary)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PayrollRowActions id={payroll.id} status={payroll.status} />
              <p className="text-[9px] text-violet-300 font-semibold italic">Verified by System</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}