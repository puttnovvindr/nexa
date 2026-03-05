import { Employee, Job, OrganizationUnit, EmploymentType, JobLevel } from "@prisma/client"

export interface JobWithDetails {
  id: string
  jobTitle: string
  orgUnit: {
    id: string
    name: string
    type: string
    parentId: string | null
  }
}

export type EmployeeWithRelations = Employee & {
  job: Job & { orgUnit: OrganizationUnit };
  employmentType: EmploymentType;
  jobLevel: JobLevel;
}

export interface Mapping {
  field: string
  index: number | null
}

export interface ImportResult {
  success: boolean
  error?: string
  count?: number 
}

export interface ImportEmployeesPayload {
  data: (string | number)[][]
  mapping: Mapping[]
}