"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { parse, isAfter, addMinutes, startOfDay, format } from "date-fns"
import {
  AttendanceImportResult,
  AttendanceImportPayload,
  AttendanceMapping,
  AttendanceStatus,
} from "@/types/attendance"
import { Prisma } from "@prisma/client"

interface UpsertOperation {
  where: Prisma.AttendanceLogWhereUniqueInput
  update: Prisma.AttendanceLogUpdateInput
  create: Prisma.AttendanceLogCreateInput
}

function parseTimeValue(val: string | number | Date | null | undefined): { hours: number, minutes: number } | null {
  if (val === null || val === undefined || val === "") return null
  
  if (typeof val === 'number') {
    const totalMinutes = Math.round(val * 1440)
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
  }
  
  if (val instanceof Date) {
    return { hours: val.getHours(), minutes: val.getMinutes() }
  }
  
  const str = String(val).trim()
  const is12Hour = /AM|PM/i.test(str)
  const formatStr = is12Hour ? "hh:mm a" : "HH:mm"
  const parsed = parse(str, formatStr, new Date())
  
  if (isNaN(parsed.getTime())) {
    const match = str.match(/(\d{1,2})[:.](\d{2})/)
    if (match) return { hours: parseInt(match[1]), minutes: parseInt(match[2]) }
    return null
  }
  
  return { hours: parsed.getHours(), minutes: parsed.getMinutes() }
}

function cellToString(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return format(value, "yyyy-MM-dd")
  return String(value).trim()
}

function resolveStatus(
  actualTime: { hours: number, minutes: number } | null,
  schedule: { checkInTime: string, gracePeriod: number } | null
): AttendanceStatus {
  if (!actualTime) return "ABSENT"
  if (!schedule) return "PRESENT"

  const [sHours, sMinutes] = schedule.checkInTime.split(":").map(Number)
  const schedDate = new Date()
  schedDate.setHours(sHours, sMinutes, 0, 0)
  
  const actualDate = new Date()
  actualDate.setHours(actualTime.hours, actualTime.minutes, 0, 0)

  const threshold = addMinutes(schedDate, schedule.gracePeriod)
  return isAfter(actualDate, threshold) ? "LATE" : "PRESENT"
}

function calculateLateMinutes(
  actualTime: { hours: number, minutes: number } | null,
  schedCheckIn: string
): number {
  if (!actualTime) return 0
  const [sHours, sMinutes] = schedCheckIn.split(":").map(Number)
  const actualTotal = actualTime.hours * 60 + actualTime.minutes
  const schedTotal = sHours * 60 + sMinutes
  return actualTotal > schedTotal ? actualTotal - schedTotal : 0
}

function calculateOvertime(
  actualTime: { hours: number, minutes: number } | null,
  schedCheckOut: string,
  threshold: number
): number {
  if (!actualTime) return 0
  const [sHours, sMinutes] = schedCheckOut.split(":").map(Number)
  const actualTotal = actualTime.hours * 60 + actualTime.minutes
  const schedTotal = sHours * 60 + sMinutes
  const diff = actualTotal - schedTotal
  return diff >= threshold ? diff : 0
}

export async function importAttendance({
  data,
  mapping,
}: AttendanceImportPayload): Promise<AttendanceImportResult> {
  try {
    const employees = await prisma.employee.findMany({
      select: { id: true, employeeId: true, workSchedule: true }
    })

    const getMappedVal = (row: (string | number | Date)[], field: string) => {
      const m = mapping.find((item) => item.field === field)
      return m?.index !== null && m?.index !== undefined ? row[m.index] : undefined
    }

    const finalOps = new Map<string, UpsertOperation>() 

    for (const row of data) {
      const nik = cellToString(getMappedVal(row, "Employee ID (NIK)"))
      const rawDate = getMappedVal(row, "Date (YYYY-MM-DD)")

      if (!nik || !rawDate) continue

      const employee = employees.find((e) => e.employeeId === nik)
      if (!employee) continue

      const dateObj = rawDate instanceof Date ? rawDate : new Date(String(rawDate))
      if (isNaN(dateObj.getTime())) continue
      const recordDate = startOfDay(dateObj)

      const inVal = getMappedVal(row, "Clock In (HH:mm)")
      const outVal = getMappedVal(row, "Clock Out (HH:mm)")

      const parsedIn = parseTimeValue(inVal)
      const parsedOut = parseTimeValue(outVal)

      let checkIn: Date | null = null
      let checkOut: Date | null = null

      if (parsedIn) {
        checkIn = new Date(recordDate)
        checkIn.setHours(parsedIn.hours, parsedIn.minutes, 0, 0)
      }
      if (parsedOut) {
        checkOut = new Date(recordDate)
        checkOut.setHours(parsedOut.hours, parsedOut.minutes, 0, 0)
      }

      const schedule = employee.workSchedule
      const status = resolveStatus(parsedIn, schedule)
      const lateMinutes = schedule && parsedIn ? calculateLateMinutes(parsedIn, schedule.checkInTime) : 0
      const overtimeMinutes = schedule && parsedOut ? calculateOvertime(parsedOut, schedule.checkOutTime, schedule.overtimeThreshold) : 0

      const key = `${employee.id}-${format(recordDate, "yyyy-MM-dd")}`
      finalOps.set(key, {
        where: { employeeId_date: { employeeId: employee.id, date: recordDate } },
        update: { 
          checkIn, 
          checkOut, 
          status, 
          lateMinutes, 
          overtimeMinutes,
          isManual: false,
          workSchedule: schedule ? { connect: { id: schedule.id } } : undefined
        },
        create: { 
          date: recordDate, 
          checkIn, 
          checkOut, 
          status, 
          lateMinutes, 
          overtimeMinutes,
          isManual: false,
          employee: { connect: { id: employee.id } },
          workSchedule: schedule ? { connect: { id: schedule.id } } : undefined
        }
      })
    }

    if (finalOps.size === 0) {
      return { success: false, error: "No valid employee records found." }
    }

    await prisma.$transaction(
      Array.from(finalOps.values()).map(op => prisma.attendanceLog.upsert(op))
    )

    revalidatePath("/attendance")
    return { success: true, count: finalOps.size, message: `Processed ${finalOps.size} records.` }

  } catch (error: unknown) {
    console.error("IMPORT_ERROR:", error)
    return { success: false, error: error instanceof Error ? error.message : "Internal Server Error" }
  }
}

export async function createManualAttendance(formData: FormData): Promise<AttendanceImportResult> {
  try {
    const nik = String(formData.get("nik") ?? "").trim()
    const dateStr = String(formData.get("date") ?? "").trim()
    const checkInStr = String(formData.get("checkIn") ?? "").trim()
    const checkOutStr = String(formData.get("checkOut") ?? "").trim()
    const notes = String(formData.get("notes") ?? "").trim()

    if (!nik || !dateStr) return { success: false, error: "NIK and Date are required." }

    const employee = await prisma.employee.findUnique({
      where: { employeeId: nik },
      include: { workSchedule: true }
    })

    if (!employee) return { success: false, error: "Employee not found." }

    const recordDate = startOfDay(new Date(dateStr))
    const parsedIn = parseTimeValue(checkInStr)
    const parsedOut = parseTimeValue(checkOutStr)

    let checkIn: Date | null = null
    let checkOut: Date | null = null

    if (parsedIn) {
      checkIn = new Date(recordDate)
      checkIn.setHours(parsedIn.hours, parsedIn.minutes, 0, 0)
    }
    if (parsedOut) {
      checkOut = new Date(recordDate)
      checkOut.setHours(parsedOut.hours, parsedOut.minutes, 0, 0)
    }

    const schedule = employee.workSchedule
    const status = resolveStatus(parsedIn, schedule)
    const lateMinutes = schedule ? calculateLateMinutes(parsedIn, schedule.checkInTime) : 0
    const overtimeMinutes = schedule ? calculateOvertime(parsedOut, schedule.checkOutTime, schedule.overtimeThreshold) : 0

    await prisma.attendanceLog.upsert({
      where: { employeeId_date: { employeeId: employee.id, date: recordDate } },
      update: { 
        checkIn, 
        checkOut, 
        status, 
        lateMinutes, 
        overtimeMinutes, 
        notes, 
        isManual: true, 
        workSchedule: employee.workScheduleId ? { connect: { id: employee.workScheduleId } } : undefined 
      },
      create: { 
        date: recordDate, 
        checkIn, 
        checkOut, 
        status, 
        lateMinutes, 
        overtimeMinutes, 
        notes, 
        isManual: true, 
        employee: { connect: { id: employee.id } },
        workSchedule: employee.workScheduleId ? { connect: { id: employee.workScheduleId } } : undefined 
      }
    })

    revalidatePath("/attendance")
    return { success: true, count: 1, message: "Attendance saved successfully." }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save." }
  }
}

export async function deleteAttendance(id: string): Promise<AttendanceImportResult> {
  try {
    await prisma.attendanceLog.delete({ where: { id } })
    revalidatePath("/attendance")
    return { success: true, message: "Deleted successfully." }
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete." }
  }
}