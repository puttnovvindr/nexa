export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"
export type LeaveTypeCategory = "PAID" | "UNPAID" | "SICK"
export type LeaveBalanceDurationType = "FULL" | "HALF" | "HOURLY"

export interface LeaveType {
  id: string
  name: string
  category: LeaveTypeCategory
  isPaid: boolean
  requiresAttachment: boolean
  defaultQuota: number
  durationType: LeaveBalanceDurationType | string
  createdAt?: Date | string
}

export interface LeaveBalance {
  id: string
  employeeId: string
  employee: LeaveBalanceEmployee
  leaveTypeId: string
  leaveType: LeaveType
  year: number
  entitlement: number
  taken: number
  remaining: number
  validFrom: Date | string | null
  validTo: Date | string | null
}

export interface LeaveBalanceEmployee {
  id: string
  employeeId: string
  fullName: string
}

export interface Leave {
  id: string
  employeeId: string
  employeeName: string
  leaveType: LeaveType
  startDate: string | Date
  endDate: string | Date
  duration: number
  status: LeaveStatus
  reason?: string
  attachmentUrl?: string | null
  approvedAt?: Date | string | null
}

export interface LeaveFormInput {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
  attachmentUrl?: string
}

export interface ColumnMapping {
  field: string
  index: number | null
}

export type Mapping = ColumnMapping

export interface ImportResult {
  success: boolean
  count?: number
  message?: string
  error?: string
}

export interface LeaveExcelImportSectionProps {
  onDataLoaded: (hasData: boolean) => void
  onFinish: (result: ImportResult) => void
}

export interface ManualLeaveBalanceFormProps {
  allEmployees: LeaveBalanceEmployee[]
  leaveTypes: LeaveType[]
  editingData: LeaveBalance | null
  loading: boolean
}

export interface LeaveBalanceControlsProps {
  allEmployees: LeaveBalanceEmployee[]
  leaveTypes: LeaveType[]
  editingData: LeaveBalance | null
  open: boolean
  onOpenChange: (val: boolean) => void
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBulkFinish: (result: ImportResult) => void
}

export interface ImportLeavesPayload {
  data: (string | number | Date)[][]
  mapping: ColumnMapping[]
}

interface FlattenedLeave extends Omit<Leave, 'startDate' | 'endDate'> {
  typeName: string
  startDate: string
  endDate: string
  [key: string]: string | number | boolean | LeaveType | null | undefined | Date
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  count?: number;
}