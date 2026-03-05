"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/form/form-field"
import { EmploymentType, JobLevel } from "@prisma/client"
import { JobWithDetails, EmployeeWithRelations } from "@/types/employee"

interface Props {
  jobs: JobWithDetails[]
  employmentTypes: EmploymentType[]
  jobLevels: JobLevel[] 
  initialData?: EmployeeWithRelations | null
}

export default function ManualImportForm({ 
  jobs = [], 
  employmentTypes = [], 
  jobLevels = [], 
  initialData 
}: Props) {
  const [selectedUnit, setSelectedUnit] = useState<string>(() => initialData?.job?.orgUnit?.name || "")
  const [selectedJobId, setSelectedJobId] = useState<string>(() => initialData?.jobId || "")
  const [selectedJobLevelId, setSelectedJobLevelId] = useState<string>(() => initialData?.jobLevelId || "")

  const units = useMemo(() => {
    const unitMap = new Map()
    jobs.forEach(job => {
      if (job?.orgUnit) unitMap.set(job.orgUnit.name, job.orgUnit.name)
    })
    return Array.from(unitMap.values())
  }, [jobs])

  const filteredJobs = useMemo(() => jobs.filter(job => job.orgUnit.name === selectedUnit), [selectedUnit, jobs])

  return (
    <div className="space-y-5 text-left font-sans w-full max-w-full overflow-hidden">
      <FormField label="Full Name" required>
        <Input 
          name="fullName" 
          defaultValue={initialData?.fullName} 
          placeholder="e.g. John Doe" 
          className="h-11 rounded-xl w-full" 
          required 
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Employee ID" required>
          <Input 
            name="employeeId" 
            defaultValue={initialData?.employeeId} 
            placeholder="e.g. 2024001" 
            className="h-11 rounded-xl w-full" 
            required 
          />
        </FormField>
        <FormField label="Email" required>
          <Input 
            name="email" 
            type="email" 
            defaultValue={initialData?.email} 
            placeholder="e.g. john@nexa.com" 
            className="h-11 rounded-xl w-full" 
            required 
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Department" required>
          <Select 
            onValueChange={(val) => { setSelectedUnit(val); setSelectedJobId(""); }} 
            defaultValue={selectedUnit || undefined}
          >
            <SelectTrigger className="h-11 rounded-xl w-full overflow-hidden">
              <SelectValue placeholder="Select dept" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {units.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Job Title" required>
          <Select 
            name="jobId" 
            onValueChange={setSelectedJobId} 
            value={selectedJobId || undefined}
            disabled={!selectedUnit}
          >
            <SelectTrigger className="h-11 rounded-xl w-full overflow-hidden">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {filteredJobs.map((j) => (<SelectItem key={j.id} value={j.id}>{j.jobTitle}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Level" required>
          <Select 
            name="jobLevelId" 
            onValueChange={setSelectedJobLevelId} 
            defaultValue={initialData?.jobLevelId || undefined}
          >
            <SelectTrigger className="h-11 rounded-xl w-full overflow-hidden">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {jobLevels.map((l) => (<SelectItem key={l.id} value={l.id}>{l.levelName}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Employment Status" required>
          <Select 
            name="employmentTypeId" 
            defaultValue={initialData?.employmentTypeId || undefined}
          >
            <SelectTrigger className="h-11 rounded-xl w-full overflow-hidden">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {employmentTypes.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </div>
  )
}