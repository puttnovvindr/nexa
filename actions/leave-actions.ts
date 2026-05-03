"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client" 
import { ColumnMapping, ImportResult, ImportLeavesPayload } from "@/types/leave"

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"

interface CreateLeaveInput {
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

async function calculateDuration(start: Date, end: Date): Promise<number> {
  const holidays = await prisma.holidayCalendar.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  })

  const holidaySet = new Set<string>(holidays.map((h) => h.date.toDateString()))

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const isHoliday = holidaySet.has(current.toDateString())
    if (!isWeekend(current) && !isHoliday) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

async function validateLeave(params: {
  employeeId: string
  start: Date
  end: Date
  excludeId?: string
}): Promise<void> {
  const { employeeId, start, end, excludeId } = params

  if (start > end) {
    throw new Error("Start date tidak boleh lebih besar dari end date")
  }

  if (isWeekend(start)) {
    throw new Error("Tidak bisa mulai leave di weekend")
  }

  const overlapping = await prisma.leave.findFirst({
    where: {
      employeeId,
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      ],
    },
  })

  if (overlapping) {
    throw new Error("Leave overlap dengan request lain")
  }

  const sameDay = await prisma.leave.findFirst({
    where: {
      employeeId,
      startDate: start,
      endDate: end,
      id: excludeId ? { not: excludeId } : undefined,
    },
  })

  if (sameDay) {
    throw new Error("Leave sudah ada di tanggal tersebut")
  }
}

export async function createLeave(data: CreateLeaveInput) {
  try {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    await validateLeave({
      employeeId: data.employeeId,
      start,
      end,
    })

    const duration = await calculateDuration(start, end)

    if (duration <= 0) {
      return { success: false, message: "Durasi leave tidak valid" }
    }

    await prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate: start,
        endDate: end,
        duration,
        reason: data.reason,
        status: "PENDING",
      },
    })

    revalidatePath("/leave")
    return { success: true, message: "Leave request submitted successfully!" }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create leave request",
    }
  }
}

export async function updateLeave(id: string, data: CreateLeaveInput) {
  try {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    const existing = await prisma.leave.findUnique({ where: { id } })
    if (!existing) throw new Error("Leave record not found")
    if (existing.status === "APPROVED") throw new Error("Cannot edit approved leave")

    await validateLeave({
      employeeId: data.employeeId,
      start,
      end,
      excludeId: id,
    })

    const duration = await calculateDuration(start, end)

    await prisma.leave.update({
      where: { id },
      data: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate: start,
        endDate: end,
        duration,
        reason: data.reason,
      },
    })

    revalidatePath("/leave")
    return { success: true, message: "Leave request updated successfully!" }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update leave request",
    }
  }
}

interface DecimalLike {
  toNumber(): number
}

export async function updateLeaveStatus(input: {
  id: string
  status: "APPROVED" | "REJECTED"
}) {
  return await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.findUnique({
      where: { id: input.id },
      include: { leaveType: true },
    })

    if (!leave) throw new Error("Leave tidak ditemukan")
    if (leave.status === "APPROVED") throw new Error("Leave sudah approved")

    const updatedLeave = await tx.leave.update({
      where: { id: input.id },
      data: { status: input.status },
    })

    if (input.status === "APPROVED") {
      const balance = await tx.leaveBalance.findFirst({
        where: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year: leave.startDate.getFullYear(),
        },
      })

      if (!balance) throw new Error("Balance tidak ditemukan untuk tahun ini")

      const getNum = (val: number | unknown): number => {
        if (typeof val === "number") return val
        if (val && typeof (val as DecimalLike).toNumber === "function") {
          return (val as DecimalLike).toNumber()
        }
        return 0
      }

      const remaining = getNum(balance.remaining)
      const duration = getNum(leave.duration)

      if (remaining < duration) {
        throw new Error(`Jatah tidak cukup. Sisa: ${remaining}, Cuti: ${duration}`)
      }

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          taken: { increment: duration },
          remaining: { decrement: duration },
        },
      })
    }

    revalidatePath("/leave")
    return { success: true, message: "Status updated and balance synced" }
  })
}

export async function getLeaveData() {
  const leaves = await prisma.leave.findMany({
    include: {
      employee: true,
      leaveType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return leaves.map((l) => ({
    id: l.id,
    employeeId: l.employeeId,
    employeeName: l.employee.fullName,
    leaveType: {
      id: l.leaveType.id,
      name: l.leaveType.name,
      category: l.leaveType.category as "PAID" | "UNPAID" | "SICK",
      isPaid: l.leaveType.isPaid,
      requiresAttachment: l.leaveType.requiresAttachment,
      defaultQuota: l.leaveType.defaultQuota,
      durationType: l.leaveType.durationType,
    },
    startDate: l.startDate.toISOString().split("T")[0],
    endDate: l.endDate.toISOString().split("T")[0],
    duration: Number(l.duration),
    status: l.status as LeaveStatus,
  }))
}

export async function importLeaves({ 
  data, 
  mapping 
}: ImportLeavesPayload): Promise<ImportResult> {
  try {
    const [masterLeaveTypes, masterEmployees] = await Promise.all([
      prisma.leaveType.findMany(),
      prisma.employee.findMany({ select: { id: true, employeeId: true } })
    ]);

    if (masterLeaveTypes.length === 0) {
      return { success: false, error: "Master data Leave Types kosong." };
    }

    const leavesToProcess: Prisma.LeaveCreateManyInput[] = [];

    for (const row of data) {
      const getVal = (fieldName: string): string => {
        const m = mapping.find(item => item.field === fieldName);
        if (!m || m.index === null || m.index === undefined) return "";
        
        const val = row[m.index];
        if (val instanceof Date) return val.toISOString();
        return val !== null && val !== undefined ? String(val).trim() : "";
      };

      const nik = getVal("Employee ID (NIK)");
      const leaveTypeName = getVal("Leave Type");
      const startDateStr = getVal("Start Date");
      const endDateStr = getVal("End Date");
      const reason = getVal("Reason / Notes");

      if (!nik || !leaveTypeName || !startDateStr || !endDateStr) continue;

      const matchedEmp = masterEmployees.find(e => e.employeeId === nik);
      const matchedType = masterLeaveTypes.find(
        t => t.name.toLowerCase() === leaveTypeName.toLowerCase()
      );

      if (!matchedEmp || !matchedType) continue;

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue;

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      leavesToProcess.push({
        employeeId: matchedEmp.id,
        leaveTypeId: matchedType.id,
        startDate: startDate,
        endDate: endDate,
        duration: duration > 0 ? duration : 1,
        reason: reason || "Imported from Bulk Upload",
        status: "PENDING",
      });
    }

    if (leavesToProcess.length === 0) {
      return { success: false, error: "Tidak ada data valid untuk di-import." };
    }

    await prisma.$transaction(
      leavesToProcess.map((item) => prisma.leave.create({ data: item }))
    );

    revalidatePath("/leave");
    return { success: true, count: leavesToProcess.length };

  } catch (error: unknown) {
    console.error("Bulk Import Leave Error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Terdapat data duplikat atau konflik pada database." };
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Terjadi kesalahan internal saat import." 
    };
  }
}