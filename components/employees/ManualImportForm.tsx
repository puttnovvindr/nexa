"use client"

import React, { useState, useMemo } from 'react'
import { FormInput, FormSelect } from "@/components/data-table/form-elements" 
import { EmploymentType, JobLevel, WorkSchedule, OrganizationUnit } from "@prisma/client"
import { JobWithDetails, EmployeeWithRelations, EmployeeFormState } from "@/types/employee"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  orgUnits: OrganizationUnit[] 
  jobs: JobWithDetails[]
  employmentTypes: EmploymentType[]
  jobLevels: JobLevel[] 
  workSchedules: WorkSchedule[]
  initialData?: EmployeeWithRelations | null
  loading?: boolean
}

const STEPS = [
  { id: 'personal', label: 'Personal' },
  { id: 'employment', label: 'Employment' },
  { id: 'identity', label: 'Identity & BPJS' },
  { id: 'payroll', label: 'Payroll' },
]

export default function ManualImportForm({ 
  orgUnits = [], 
  jobs = [], 
  employmentTypes = [], 
  jobLevels = [], 
  workSchedules = [], 
  initialData,
  loading = false
}: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [touched, setTouched] = useState(false)

  const [formData, setFormData] = useState<EmployeeFormState>({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    officeEmail: initialData?.officeEmail || "",
    gender: initialData?.gender || "",
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
    employeeId: initialData?.employeeId || "",
    joinDate: initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : "",
    orgUnitId: initialData?.job?.orgUnitId || "",
    jobId: initialData?.jobId || "",
    jobLevelId: initialData?.jobLevelId || "",
    employmentTypeId: initialData?.employmentTypeId || "",
    workScheduleId: initialData?.workScheduleId || "",
    superiorId: initialData?.superiorId || "",
    identityNumber: initialData?.identityNumber || "",
    taxId: initialData?.taxId || "",
    bpjsKesehatanNumber: initialData?.bpjsKesehatanNumber || "",
    bpjsKetenagakerjaanNumber: initialData?.bpjsKetenagakerjaanNumber || "",
    bankName: initialData?.bankName || "",
    bankAccount: initialData?.bankAccount || "",
    bankAccountName: initialData?.bankAccountName || "",
    ptkpStatus: initialData?.ptkpStatus || "TK/0",
  })

  const unitOptions = useMemo(() => orgUnits.map(unit => ({ label: unit.name, value: unit.id })), [orgUnits])
  const filteredJobs = useMemo(() => {
    if (!formData.orgUnitId) return []
    return jobs.filter(job => job.orgUnitId === formData.orgUnitId).map(j => ({ label: j.jobTitle, value: j.id }))
  }, [formData.orgUnitId, jobs])

  const errors = useMemo(() => ({
    fullName: formData.fullName.trim().length < 3 ? "Name is too short" : null,
    officeEmail: !/^\S+@\S+\.\S+$/.test(formData.officeEmail) ? "Invalid office email" : null,
    employeeId: formData.employeeId.trim() === "" ? "Employee ID is required" : null,
    joinDate: formData.joinDate === "" ? "Join date is required" : null,
    orgUnitId: formData.orgUnitId === "" ? "Please select department" : null,
    jobId: formData.jobId === "" ? "Please select job" : null,
    jobLevelId: formData.jobLevelId === "" ? "Please select level" : null,
    employmentTypeId: formData.employmentTypeId === "" ? "Please select type" : null,
  }), [formData])

  const isStepValid = useMemo(() => {
    if (activeStep === 0) return !errors.fullName && !errors.officeEmail
    if (activeStep === 1) return !errors.employeeId && !errors.joinDate && !errors.orgUnitId && !errors.jobId && !errors.jobLevelId && !errors.employmentTypeId
    return true
  }, [activeStep, errors])

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    setTouched(true)
    if (isStepValid && activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1)
      setTouched(false)
    }
  }

  return (
    <div className="w-full font-poppins">
      <div className="flex items-center justify-between mb-10 px-4 w-full">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 relative z-10 min-w-[70px]">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 text-[12px] font-bold",
                activeStep > idx ? "bg-violet-600 border-violet-600 text-white" : 
                activeStep === idx ? "border-violet-600 text-violet-600 bg-white" : 
                "border-slate-200 text-slate-300 bg-white"
              )}>
                {idx + 1}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                activeStep >= idx ? "text-violet-600" : "text-slate-300"
              )}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] bg-slate-100 relative -mt-6 z-0 mx-2">
                <div className={cn(
                  "absolute inset-0 bg-violet-600 transition-all duration-500 origin-left scale-x-0", 
                  activeStep > idx && "scale-x-100"
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="h-[240px] overflow-y-auto px-1 pr-4 custom-scroll w-full scroll-smooth">
        <div className={cn("space-y-6 animate-in fade-in duration-300", activeStep !== 0 && "hidden")}>
          <div className="space-y-4">
            <FormInput label="Full Name" name="fullName" placeholder="Enter full name" value={formData.fullName} error={touched ? (errors.fullName ?? undefined) : undefined} onChange={(e) => setFormData(p => ({...p, fullName: e.target.value}))} required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Office Email" name="officeEmail" placeholder="work@company.com" value={formData.officeEmail} error={touched ? (errors.officeEmail ?? undefined) : undefined} onChange={(e) => setFormData(p => ({...p, officeEmail: e.target.value}))} required />
              <FormInput label="Personal Email (Optional)" name="email" placeholder="personal@mail.com" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Gender" name="gender" placeholder="Select gender" defaultValue={formData.gender} onChange={(val) => setFormData(p => ({...p, gender: val as string}))} options={[{label: "Male", value: "MALE"}, {label: "Female", value: "FEMALE"}]} />
              <FormInput label="Birth Date" name="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData(p => ({...p, birthDate: e.target.value}))} />
            </div>
          </div>
        </div>

        <div className={cn("space-y-6 animate-in fade-in duration-300", activeStep !== 1 && "hidden")}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Employee ID" name="employeeId" placeholder="E001" value={formData.employeeId} error={touched ? (errors.employeeId ?? undefined) : undefined} onChange={(e) => setFormData(p => ({...p, employeeId: e.target.value}))} required />
              <FormInput label="Join Date" name="joinDate" type="date" value={formData.joinDate} error={touched ? (errors.joinDate ?? undefined) : undefined} onChange={(e) => setFormData(p => ({...p, joinDate: e.target.value}))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Department" name="orgUnitId" placeholder="Select department" options={unitOptions} defaultValue={formData.orgUnitId} error={touched ? (errors.orgUnitId ?? undefined) : undefined} onChange={(val) => setFormData(p => ({...p, orgUnitId: val as string, jobId: ""}))} required />
              <FormSelect label="Job Title" name="jobId" placeholder="Select job title" defaultValue={formData.jobId} error={touched ? (errors.jobId ?? undefined) : undefined} options={filteredJobs} onChange={(val) => setFormData(p => ({...p, jobId: val as string}))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Job Level" name="jobLevelId" placeholder="Select level" defaultValue={formData.jobLevelId} error={touched ? (errors.jobLevelId ?? undefined) : undefined} options={jobLevels.map(l => ({label: l.levelName, value: l.id}))} onChange={(val) => setFormData(p => ({...p, jobLevelId: val as string}))} required />
              <FormSelect label="Employment Type" name="employmentTypeId" placeholder="Select type" defaultValue={formData.employmentTypeId} error={touched ? (errors.employmentTypeId ?? undefined) : undefined} options={employmentTypes.map(t => ({label: t.name, value: t.id}))} onChange={(val) => setFormData(p => ({...p, employmentTypeId: val as string}))} required />
            </div>
            <FormSelect label="Work Schedule" name="workScheduleId" placeholder="Select schedule" defaultValue={formData.workScheduleId} onChange={(val) => setFormData(p => ({...p, workScheduleId: val as string}))} options={workSchedules.map((s) => ({ label: s.shiftName, value: s.id }))} />
          </div>
        </div>

        <div className={cn("space-y-6 animate-in fade-in duration-300", activeStep !== 2 && "hidden")}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="KTP (NIK)" name="identityNumber" placeholder="320..." value={formData.identityNumber} onChange={(e) => setFormData(p => ({...p, identityNumber: e.target.value}))} />
              <FormInput label="NPWP (Tax ID)" name="taxId" placeholder="00..." value={formData.taxId} onChange={(e) => setFormData(p => ({...p, taxId: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="BPJS Kesehatan" name="bpjsKesehatanNumber" placeholder="000..." value={formData.bpjsKesehatanNumber} onChange={(e) => setFormData(p => ({...p, bpjsKesehatanNumber: e.target.value}))} />
              <FormInput label="BPJS Ketenagakerjaan" name="bpjsKetenagakerjaanNumber" placeholder="000..." value={formData.bpjsKetenagakerjaanNumber} onChange={(e) => setFormData(p => ({...p, bpjsKetenagakerjaanNumber: e.target.value}))} />
            </div>
          </div>
        </div>

        <div className={cn("space-y-6 animate-in fade-in duration-300", activeStep !== 3 && "hidden")}>
          <div className="space-y-4">
            <FormInput label="Bank Name" name="bankName" placeholder="e.g. BCA / Mandiri" value={formData.bankName} onChange={(e) => setFormData(p => ({...p, bankName: e.target.value}))} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Account Number" name="bankAccount" placeholder="12345..." value={formData.bankAccount} onChange={(e) => setFormData(p => ({...p, bankAccount: e.target.value}))} />
              <FormInput label="Account Holder" name="bankAccountName" placeholder="Name on account" value={formData.bankAccountName} onChange={(e) => setFormData(p => ({...p, bankAccountName: e.target.value}))} />
            </div>
            <FormSelect label="PTKP Status" name="ptkpStatus" placeholder="Select status" defaultValue={formData.ptkpStatus} onChange={(val) => setFormData(p => ({...p, ptkpStatus: val as string}))} 
              options={[
                {label: "TK/0", value: "TK/0"}, {label: "K/0", value: "K/0"}, {label: "K/1", value: "K/1"}, {label: "K/2", value: "K/2"}, {label: "K/3", value: "K/3"}
              ]} 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 w-full">
        <Button type="button" variant="ghost" onClick={() => setActiveStep(v => v - 1)} disabled={activeStep === 0 || loading} className="text-slate-500 font-medium text-[13px] h-10 px-6 hover:bg-slate-50 cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext} className="h-10 px-8 rounded-md font-semibold text-[13px] bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-sm cursor-pointer">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit" disabled={loading} className="h-10 px-8 rounded-md font-semibold text-[13px] bg-violet-600 text-white hover:bg-violet-700 shadow-sm cursor-pointer">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Submit Data"}
          </Button>
        )}
      </div>
    </div>
  )
}