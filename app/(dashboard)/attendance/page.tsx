import { prisma } from "@/lib/prisma"
import AttendanceClient from "@/components/attendance/AttendanceClient"

export default async function AttendancePage() {
  const [attendance, jobs, jobLevels, employmentTypes] = await Promise.all([
    prisma.attendanceLog.findMany({
      include: {
        employee: {
          include: {
            workSchedule: true, 
          }
        },
      },
      orderBy: { date: 'desc' }
    }),
    prisma.job.findMany({
      include: {
        orgUnit: true,
      },
    }),
    prisma.jobLevel.findMany(),
    prisma.employmentType.findMany(),
  ])
  
  const totalPresent = attendance.filter((a) => a.status === "PRESENT").length
  const totalLate    = attendance.filter((a) => a.status === "LATE").length
  const totalAbsent  = attendance.filter((a) => a.status === "ABSENT").length
  
  const onTimeRate = attendance.length > 0
    ? Math.round(((attendance.length - totalLate - totalAbsent) / attendance.length) * 100)
    : 0

  return (
    <AttendanceClient
      data={attendance}
      stats={{ 
        totalPresent, 
        totalLate, 
        totalAbsent, 
        onTimeRate 
      }}
      jobs={jobs}
      jobLevels={jobLevels}
      employmentTypes={employmentTypes}
    />
  )
}