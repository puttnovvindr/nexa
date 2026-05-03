import {
  Employee,
  Job,
  OrganizationUnit,
  EmploymentType,
  JobLevel,
  WorkSchedule,
} from "@prisma/client"

export type JobWithDetails = Job & {
  orgUnit: OrganizationUnit & {
    parent?: OrganizationUnit | null
  }
  createdAt: Date | string 
  updatedAt: Date | string
  status: "ACTIVE" | "INACTIVE"
  isVancancy: boolean 
  _count?: {
    employees: number
  }
}

export type EmployeeWithRelations = Employee & {
  job: JobWithDetails
  employmentType: EmploymentType
  jobLevel: JobLevel
  workSchedule: WorkSchedule | null
  superior?: Employee | null
  gender?: string | null
  birthDate?: Date | null
  officeEmail?: string | null
  identityNumber?: string | null
  taxId?: string | null
  ptkpStatus?: string | null
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
  bpjsKesehatanNumber?: string | null
  bpjsKetenagakerjaanNumber?: string | null
  createdBy?: string | null
  updatedBy?: string | null
}

export type EmployeeFormState = {
  fullName: string
  email: string
  officeEmail: string
  gender: string
  birthDate: string
  employeeId: string
  joinDate: string
  orgUnitId: string
  jobId: string
  jobLevelId: string
  employmentTypeId: string
  workScheduleId: string
  superiorId: string
  identityNumber: string
  taxId: string
  bpjsKesehatanNumber: string
  bpjsKetenagakerjaanNumber: string
  bankName: string
  bankAccount: string
  bankAccountName: string
  ptkpStatus: string
}

export type FlattenedEmployee = EmployeeWithRelations & {
  deptName: string
  jobTitleName: string
  levelName: string
  statusName: string
  shiftName: string
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