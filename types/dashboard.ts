import { Employee, JobLevel, EmploymentType, Job, OrganizationUnit, WorkSchedule } from "@prisma/client";

export type EmployeeWithRelations = Employee & {
  jobLevel: JobLevel;
  employmentType: EmploymentType;
  workSchedule: WorkSchedule | null; 
  job: Job & {
    orgUnit: OrganizationUnit;
  };
};

export interface ReportStats {
  employee: {
    total: number;
    active: number;
  };
  attendance: {
    present: number;
    late: number;
  };
  payroll: {
    totalExpense: number;
    totalPaid: number;
  };
}