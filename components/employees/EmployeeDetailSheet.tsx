"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { FlattenedEmployee } from "@/types/employee"
import { cn } from "@/lib/utils"
import {
  User, MapPin, Briefcase, Wallet, ShieldCheck, Phone,
  CalendarCheck, LucideIcon, Fingerprint, HeartPulse,
  Building2, Clock, Mail, X, ChevronRight
} from "lucide-react"

interface EmployeeDetailSheetProps {
  employee: FlattenedEmployee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

const Field = ({
  label, value, mono = false
}: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="group flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-0">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
    <span className={cn(
      "text-[13px] font-medium text-slate-800 mt-0.5",
      mono && "font-mono tracking-tight text-[12px]"
    )}>
      {value || <span className="text-slate-300">—</span>}
    </span>
  </div>
)

const Section = ({
  title, icon: Icon, children, accent = "violet"
}: {
  title: string; icon: LucideIcon; children: React.ReactNode; accent?: string
}) => {
  const accentMap: Record<string, { dot: string; label: string }> = {
    violet: { dot: "bg-violet-500", label: "text-violet-600" },
    rose: { dot: "bg-rose-400", label: "text-rose-500" },
    blue: { dot: "bg-blue-400", label: "text-blue-500" },
    emerald: { dot: "bg-emerald-400", label: "text-emerald-600" },
    amber: { dot: "bg-amber-400", label: "text-amber-600" },
    cyan: { dot: "bg-cyan-400", label: "text-cyan-600" },
    orange: { dot: "bg-orange-400", label: "text-orange-500" },
  }
  const a = accentMap[accent] || accentMap.violet
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", a.dot)} />
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", a.label)}>{title}</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  )
}

const StatusPill = ({ status }: { status: string }) => {
  const s = status.toLowerCase()
  if (s.includes("permanent") || s.includes("active"))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{status}</span>
  if (s.includes("probation"))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{status}</span>
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-50 text-slate-600 border border-slate-200">{status}</span>
}

export function EmployeeDetailSheet({ employee, open, onOpenChange }: EmployeeDetailSheetProps) {
  if (!employee) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 h-screen bg-slate-900/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />

      <div className={cn(
        "fixed top-0 right-0 h-full w-[680px] max-w-full z-50 bg-white",
        "border-l border-slate-200 shadow-2xl shadow-slate-900/10",
        "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 leading-none">Employee Profile</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">#{employee.employeeId}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none">{employee.fullName}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[12px] text-slate-500 font-medium">{employee.jobTitleName}</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-[12px] text-violet-600 font-semibold">{employee.deptName}</span>
              </div>
            </div>
            <StatusPill status={employee.statusName} />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Location</span>
              <span className="text-[12px] font-semibold text-slate-700">{employee.location || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Join Date</span>
              <span className="text-[12px] font-semibold text-slate-700">{formatDate(employee.joinDate)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Level</span>
              <span className="text-[12px] font-semibold text-slate-700">{employee.levelName}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
        >
          <Section title="Personal Information" icon={HeartPulse} accent="rose">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <Field label="Gender" value={employee.gender} />
                <Field label="Birth Date" value={formatDate(employee.birthDate)} />
                <Field label="Religion" value={employee.religion} />
              </div>
              <div>
                <Field label="Marital Status" value={employee.maritalStatus} />
                <Field label="Children" value={String(employee.numberOfChildren)} />
                <Field label="Disability" value={employee.isDisability ? "Yes" : "No"} />
              </div>
            </div>
          </Section>

          <Section title="Identity & Legal" icon={Fingerprint} accent="blue">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <Field label="Citizenship" value={employee.citizenship} />
                <Field label="Tax ID (NPWP)" value={employee.taxId} mono />
              </div>
              <div>
                <Field label="Identity Number" value={employee.identityNumber} mono />
                <Field label="Passport No." value={employee.passportNumber} mono />
              </div>
            </div>
          </Section>

          <Section title="Contact Details" icon={Phone} accent="emerald">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <Field label="Email Address" value={employee.email} />
                <Field label="Phone Number" value={employee.phoneNumber} />
              </div>
              <div>
                <Field label="Emergency Contact" value={employee.emergencyContactName} />
                <Field label="Emergency Phone" value={employee.emergencyContactPhone} mono />
              </div>
            </div>
          </Section>

          <Section title="Residential Address" icon={MapPin} accent="orange">
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed py-3">
              {employee.address || <span className="text-slate-300">No address recorded.</span>}
            </p>
          </Section>

          <Section title="Employment & Organization" icon={Briefcase} accent="violet">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <Field label="Department" value={employee.deptName} />
                <Field label="Job Title" value={employee.jobTitleName} />
                <Field label="Level" value={employee.levelName} />
              </div>
              <div>
                <Field label="Work Schedule" value={employee.shiftName} />
                <Field label="Direct Manager" value={employee.superior?.fullName} />
              </div>
            </div>
          </Section>

          <Section title="Finance Information" icon={Wallet} accent="amber">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <Field label="Bank Name" value={employee.bankName} />
                <Field label="Account Number" value={employee.bankAccount} mono />
              </div>
              <div>
                <Field label="Account Holder" value={employee.bankAccountName} />
                <Field label="PTKP Status" value={employee.ptkpStatus} />
              </div>
            </div>
          </Section>

          <Section title="Schedule & Contract" icon={Clock} accent="cyan">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Shift</p>
                <p className="text-[12px] font-bold text-slate-800">{employee.shiftName || "Not Set"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Probation End</p>
                <p className="text-[12px] font-bold text-slate-800">{formatDate(employee.probationEndDate)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Contract End</p>
                <p className="text-[12px] font-bold text-slate-800">{formatDate(employee.contractEndDate)}</p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}