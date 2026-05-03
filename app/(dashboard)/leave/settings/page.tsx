import { prisma } from "@/lib/prisma"
import { LeaveSettingsClient } from "@/components/settings/leave/LeaveSettingsClient"

export default async function LeaveSettingsPage() {
  const [leaveTypes, leaveBalances, allEmployees] = await Promise.all([
    prisma.leaveType.findMany({
      orderBy: { createdAt: "desc" },
    }),

    prisma.leaveBalance.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
          },
        },
        leaveType: true,
      },
      orderBy: {
        employee: {
          fullName: "asc",
        },
      },
    }),

    prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        fullName: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),
  ])

  return (
    <div className="h-full overflow-hidden">
      <LeaveSettingsClient
        leaveTypes={leaveTypes}
        leaveBalances={leaveBalances}
        allEmployees={allEmployees}
      />
    </div>
  )
}