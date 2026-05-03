import {
  Employee,
  Job,
  JobLevel,
  EmploymentType,
  EmploymentBasis,
  CalculationBase,
  PayrollStatus as PrismaPayrollStatus,
} from "@prisma/client"

export type { PrismaPayrollStatus as PayrollStatus }

export type SerializedPayrollComponent = {
  id: string
  payrollId: string
  name: string
  category: string
  amount: number
}

export type SerializedPayroll = {
  id: string
  employeeId: string
  month: number
  year: number
  basisSnapshot: EmploymentBasis
  baseRateSnapshot: number
  netSalary: number
  status: PrismaPayrollStatus
  createdAt: Date
  payslipNumber: string | null
  paidAt: Date | null
  components: SerializedPayrollComponent[]
  employee: Pick<
    Employee,
    "fullName" | "employeeId" | "email" | "bankName" | "bankAccount" | "taxId"
  > & {
    ptkpStatus?: string
    salaryConfig: {
      basis: EmploymentBasis
      baseRate: number
      ptkpStatus: string
    } | null
    job: {
      jobTitle: string
      orgUnit: { name: string }
    }
  }
}

export type FlattenedPayroll = SerializedPayroll & {
  employeeName: string
  jobTitle: string
  departmentName: string
  isAnomaly: boolean
  anomalyReason?: string
  basicSalary: number
  totalOvertime: number
  totalAllowance: number
  totalDeduction: number
}

export type SerializedComponentMaster = {
  id: string
  name: string
  category: string
  base: CalculationBase
  defaultAmount: number
  isTaxable: boolean
  deductionType: string | null
  description: string | null
  groupName: string | null
  createdAt: Date | string
  _count: { configs: number }
}

export type SerializedSalaryConfig = {
  id: string
  employeeId: string
  basis: EmploymentBasis
  baseRate: number
  ptkpStatus: string
  createdAt: Date | string
  updatedAt: Date
  employee: {
    id: string
    fullName: string
    employeeId: string
    email: string
  }
  components: {
    id: string
    masterId: string
    customAmount: number | null
    master: {
      name: string
      category: string
      base: CalculationBase
      defaultAmount: number
      groupName: string | null
    }
  }[]
  _count: { components: number }
}

export interface PayrollTableProps {
  data: SerializedPayroll[]
  jobs?: (Job & { orgUnit: { name: string } })[]
  jobLevels?: JobLevel[]
  employmentTypes?: EmploymentType[]
}

export interface PayrollAttendanceStats {
  actualWorkDays: number
  paidLeaveDays: number
  unpaidDays: number
  lateCount: number
  lateMinutes: number
  otHours: number
}