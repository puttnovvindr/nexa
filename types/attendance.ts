import { AttendanceLog, WorkSchedule } from "@prisma/client"

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT"

export type AttendanceWithEmployee = AttendanceLog & {
  employee: {
    id: string
    fullName: string
    employeeId: string
    email: string
    workSchedule: WorkSchedule | null
  }
  workSchedule: WorkSchedule | null
}

export interface AttendanceImportResult {
  success: boolean
  count?: number
  error?: string
  message?: string
  totalOvertimeMinutes?: number
}

export interface AttendanceMapping {
  field: AttendanceImportField
  index: number | null
}

export type AttendanceImportField =
  | "Employee ID (NIK)"
  | "Date (YYYY-MM-DD)"
  | "Clock In (HH:mm)"
  | "Clock Out (HH:mm)"

export interface AttendanceImportPayload {
  data: (string | number | Date)[][]
  mapping: AttendanceMapping[]
}

export interface OvertimeSummary {
  employeeName: string
  date: Date
  duration: number
  formattedDuration: string
}

export interface AttendanceStats {
  totalPresent: number
  totalLate: number
  totalAbsent: number
  onTimeRate: number
}

export interface AttendanceImportSectionProps {
  onDataLoaded: (hasData: boolean) => void
  onFinish: (result: AttendanceImportResult) => void
}

export interface AttendanceManualEntryProps {
  loading: boolean
}

export interface AttendanceImportModalProps {
  open: boolean
  onOpenChange: (val: boolean) => void
  isPending: boolean
  onManualSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBulkFinish: (result: AttendanceImportResult) => void
}