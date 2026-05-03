import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient"; 
import { startOfDay, endOfDay } from "date-fns";

export default async function ReportsPage() {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [employees, jobLevels, employmentTypes, attendanceLogs] = await Promise.all([
    prisma.employee.findMany({
      include: {
        jobLevel: true,
        employmentType: true,
        workSchedule: true,
        job: { include: { orgUnit: true } }
      }
    }),
    prisma.jobLevel.findMany(),
    prisma.employmentType.findMany(),
    prisma.attendanceLog.findMany({ 
      where: {
        date: { gte: todayStart, lte: todayEnd }
      },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeId: true,
            email: true
          }
        },
        workSchedule: true
      }
    })
  ]);

  return (
    <DashboardClient 
      employees={employees} 
      attendances={attendanceLogs} 
      jobLevels={jobLevels}
      employmentTypes={employmentTypes}
    />
  );
}