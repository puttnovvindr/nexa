import EmployeeSettingsClient from "@/components/settings/employees/EmployeeSettingsClient"
import { prisma } from "@/lib/prisma"
import { JobWithDetails } from "@/types/employee"

export const dynamic = "force-dynamic"

export default async function EmployeeSettingsPage() {
  const [units, rawJobs, jobLevels, employmentTypes, workSchedules] = await Promise.all([
    prisma.organizationUnit.findMany({
      include: { parent: true }
    }),
    prisma.job.findMany({
      include: { 
        orgUnit: true,
        _count: { select: { employees: true } }
      }
    }),
    prisma.jobLevel.findMany(),
    prisma.employmentType.findMany(),
    prisma.workSchedule.findMany()
  ])

  const jobs: JobWithDetails[] = rawJobs.map(job => ({
    ...job,
    createdAt: new Date(), 
    updatedAt: new Date(),
    status: "ACTIVE", 
    isVancancy: job._count.employees === 0 
  }))

  return (
    <div className="flex flex-col overflow-hidden font-poppins">
      <EmployeeSettingsClient
        data={[]} 
        units={units}
        jobs={jobs} 
        jobLevels={jobLevels}
        employmentTypes={employmentTypes}
        workSchedules={workSchedules}
      />
    </div>
  )
}