import { prisma } from "@/lib/prisma"
import EmployeeTable from "@/components/employees/EmployeeTable"

export default async function EmployeesPage() {
  const [employees, jobs, levels, employmentTypes] = await Promise.all([
    prisma.employee.findMany({
      include: {
        job: { 
          include: { orgUnit: true } 
        },
        jobLevel: true,
        employmentType: true 
      },
      orderBy: { joinDate: 'desc' }
    }),
    prisma.job.findMany({ 
      include: { orgUnit: true },
      orderBy: { jobTitle: 'asc' } 
    }),
    prisma.jobLevel.findMany({ 
      orderBy: { levelName: 'asc' } 
    }),
    prisma.employmentType.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <div className="p-8 space-y-6">
      <EmployeeTable 
        data={employees} 
        jobs={jobs}
        jobLevels={levels}
        employmentTypes={employmentTypes} 
      />
    </div>
  )
}