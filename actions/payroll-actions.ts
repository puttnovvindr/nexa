"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { startOfMonth, endOfMonth } from "date-fns"
import { 
  PayrollStatus, 
  EmploymentBasis, 
  CalculationBase 
} from "@prisma/client"
import { 
  SerializedSalaryConfig, 
  PayrollAttendanceStats 
} from "@/types/payroll"

function resolveComponentValue(
  master: SerializedSalaryConfig["components"][number]["master"],
  customAmount: number | null,
  stats: PayrollAttendanceStats,
  currentBaseRate: number
): number {
  const rate = customAmount ?? master.defaultAmount

  switch (master.base) {
    case CalculationBase.FIXED:
      return rate
    case CalculationBase.PERCENT_BASE:
    case CalculationBase.PERCENT_GROSS:
      return currentBaseRate * (rate / 100)
    case CalculationBase.ATTENDANCE_DAYS:
      return rate * stats.actualWorkDays
    case CalculationBase.LATE_COUNT:
      return rate * stats.lateCount
    case CalculationBase.LATE_MINUTES:
      return rate * stats.lateMinutes
    case CalculationBase.OVERTIME_HOURS:
      return rate * stats.otHours
    case CalculationBase.WORK_HOURS:
      return rate * (stats.otHours + (stats.actualWorkDays * 8))
    default:
      return 0
  }
}

export interface PayrollResult {
  success: boolean
  message?: string
  error?: string
  count?: number
  data?: { id: string }
}

export async function processPayroll(
  employeeId: string,
  month: number,
  year: number
): Promise<PayrollResult> {
  try {
    const config = (await prisma.salaryConfig.findUnique({
      where: { employeeId },
      include: {
        components: { include: { master: true } },
        employee: true,
      },
    })) as unknown as SerializedSalaryConfig

    if (!config) return { success: false, error: "Salary configuration not found" }

    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

    const [logs, approvedLeaves] = await Promise.all([
      prisma.attendanceLog.findMany({
        where: { employeeId, date: { gte: startDate, lte: endDate } },
      }),
      prisma.leave.findMany({
        where: {
          employeeId,
          status: "APPROVED",
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        include: { leaveType: true },
      }),
    ])

    const stats: PayrollAttendanceStats = {
      actualWorkDays: logs.filter((l) => l.status === "PRESENT" || l.status === "LATE").length,
      paidLeaveDays: approvedLeaves.filter((l) => l.leaveType.isPaid).length,
      unpaidDays: approvedLeaves.filter((l) => !l.leaveType.isPaid).length,
      lateCount: logs.filter((l) => l.status === "LATE").length,
      lateMinutes: logs.reduce((acc, l) => acc + (l.lateMinutes || 0), 0),
      otHours: logs.reduce((acc, l) => acc + (l.overtimeMinutes || 0) / 60, 0),
    }

    let baseSalary = Number(config.baseRate)

    if (config.basis === EmploymentBasis.HOURLY) {
      baseSalary *= (stats.actualWorkDays * 8) + stats.otHours
    } else if (config.basis === EmploymentBasis.DAILY) {
      baseSalary *= stats.actualWorkDays
    } else {
      baseSalary = Number(config.baseRate)
    }

    let runningNetSalary = baseSalary 
    const componentSnapshots: { name: string; category: string; amount: number }[] = []

    for (const item of config.components) {
      const val = resolveComponentValue(item.master, item.customAmount, stats, baseSalary)

      if (item.master.category === "EARNING") {
        runningNetSalary += val
      } else {
        runningNetSalary -= val
      }

      componentSnapshots.push({
        name: item.master.name,
        category: item.master.category,
        amount: Math.round(val),
      })
    }

    const result = await prisma.payroll.upsert({
      where: { employeeId_month_year: { employeeId, month, year } },
      create: {
        employeeId,
        month,
        year,
        basisSnapshot: config.basis,
        baseRateSnapshot: config.baseRate,
        netSalary: Math.round(runningNetSalary),
        status: PayrollStatus.DRAFT,
        components: { create: componentSnapshots },
      },
      update: {
        netSalary: Math.round(runningNetSalary),
        basisSnapshot: config.basis,
        baseRateSnapshot: config.baseRate,
        components: {
          deleteMany: {},
          create: componentSnapshots,
        },
      },
    })

    return { success: true, data: { id: result.id } }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memproses payroll"
    return { success: false, error: msg }
  }
}

export async function bulkGeneratePayroll(month: number, year: number): Promise<PayrollResult> {
  try {
    const employees = await prisma.employee.findMany({
      where: { salaryConfig: { isNot: null } },
      select: { id: true },
    })

    let successCount = 0
    for (const emp of employees) {
      const res = await processPayroll(emp.id, month, year)
      if (res.success) successCount++
    }

    revalidatePath("/payroll")
    return { success: true, message: `Berhasil memproses ${successCount} karyawan`, count: successCount }
  } catch (err) {
    return { success: false, error: "Bulk generation failed" }
  }
}

export async function updatePayrollStatusBulk(
  ids: string[],
  status: PayrollStatus,
  processedByUserId?: string
): Promise<PayrollResult> {
  try {
    await prisma.payroll.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        processedById: processedByUserId || null,
      },
    })
    revalidatePath("/payroll")
    return { success: true, message: "Status payroll berhasil diperbarui secara massal" }
  } catch {
    return { success: false, error: "Gagal memperbarui status secara massal" }
  }
}

export async function updateSalaryConfig(formData: FormData): Promise<PayrollResult> {
  const employeeId = formData.get("employeeId") as string
  const basis = formData.get("basis") as EmploymentBasis
  const baseRate = parseFloat(formData.get("baseRate") as string)

  if (!employeeId || isNaN(baseRate)) return { success: false, error: "Invalid data" }

  try {
    const employee = await prisma.employee.findFirst({ where: { employeeId }, select: { id: true } })
    if (!employee) return { success: false, error: "Employee not found" }

    await prisma.salaryConfig.upsert({
      where: { employeeId: employee.id },
      update: { basis, baseRate },
      create: { employeeId: employee.id, basis: basis || EmploymentBasis.MONTHLY, baseRate },
    })

    revalidatePath("/payroll")
    revalidatePath("/payroll/settings")
    return { success: true, message: "Salary configuration updated" }
  } catch (err) {
    return { success: false, error: "Database update failed" }
  }
}

export async function updatePayrollStatus(id: string, status: PayrollStatus): Promise<PayrollResult> {
  try {
    await prisma.payroll.update({ where: { id }, data: { status } })
    revalidatePath("/payroll")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Failed to update status" }
  }
}

export async function deletePayroll(id: string): Promise<PayrollResult> {
  try {
    const existing = await prisma.payroll.findUnique({ where: { id }, select: { status: true } })
    if (!existing || existing.status === PayrollStatus.PAID) {
      return { success: false, error: "Payroll tidak bisa dihapus." }
    }
    await prisma.payroll.delete({ where: { id } })
    revalidatePath("/payroll")
    return { success: true, message: "Payroll record deleted" }
  } catch (err) {
    return { success: false, error: "Delete failed" }
  }
}