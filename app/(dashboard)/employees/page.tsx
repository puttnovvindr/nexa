import { prisma } from "@/lib/prisma"
import EmployeesClient from "@/components/employees/EmployeesClient"
import { EmployeeWithRelations, JobWithDetails } from "@/types/employee"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employees | HRIS Portal",
}

export default async function EmployeesPage() {
  const [employees, orgUnits, jobs, jobLevels, employmentTypes, workSchedules] = await Promise.all([
    prisma.employee.findMany({
      include: {
        job: { include: { orgUnit: true } },
        jobLevel: true,
        employmentType: true,
        workSchedule: true,
        superior: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.organizationUnit.findMany({ orderBy: { name: "asc" } }),
    prisma.job.findMany({
      include: { orgUnit: true },
      orderBy: { jobTitle: "asc" },
    }),
    prisma.jobLevel.findMany({ orderBy: { levelName: "asc" } }),
    prisma.employmentType.findMany({ orderBy: { name: "asc" } }),
    prisma.workSchedule.findMany({ orderBy: { shiftName: "asc" } }),
  ])

  return (
    <div className="flex flex-col gap-6 font-poppins">
      <EmployeesClient
        data={employees as EmployeeWithRelations[]}
        orgUnits={orgUnits}
        jobs={jobs as JobWithDetails[]}
        jobLevels={jobLevels}
        employmentTypes={employmentTypes}
        workSchedules={workSchedules}
      />
    </div>
  )
}