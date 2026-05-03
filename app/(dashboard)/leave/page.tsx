import LeaveClient from "@/components/leave/LeaveClient"
import { getLeaveData } from "@/actions/leave-actions"
import { prisma } from "@/lib/prisma"

export default async function LeavePage() {
  const [data, leaveTypes] = await Promise.all([
    getLeaveData(),
    prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  const mappedLeaveTypes = leaveTypes.map((lt) => ({
    id: lt.id,
    name: lt.name,
    category: lt.category as "PAID" | "UNPAID" | "SICK",
    isPaid: lt.isPaid,
    requiresAttachment: lt.requiresAttachment,
    defaultQuota: lt.defaultQuota,
    durationType: lt.durationType,
    createdAt: lt.createdAt,
  }))

  return (
    <LeaveClient
      data={data}
      leaveTypes={mappedLeaveTypes}
      currentEmployeeId=""
    />
  )
}