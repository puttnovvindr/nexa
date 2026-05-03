"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EmploymentBasis, CalculationBase, LeaveTypeCategory } from "@prisma/client"
import { ColumnMapping, ImportResult } from "@/types/leave"

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
  count?: number
}

function normalizeParentId(parentId?: string | null): string | null {
  if (!parentId || parentId === "none" || parentId === "root") return null
  return parentId
}

async function resolveOrgType(parentId: string | null): Promise<string> {
  if (!parentId) return "Head Office"
  const parent = await prisma.organizationUnit.findUnique({ where: { id: parentId } })
  return parent?.parentId ? "Division" : "Department"
}

export async function createOrgUnit(name: string, parentId?: string | null): Promise<ActionResult> {
  try {
    if (!name.trim()) return { success: false, error: "Name is required" }
    const normalizedParentId = normalizeParentId(parentId)
    const type = await resolveOrgType(normalizedParentId)
    await prisma.organizationUnit.create({ data: { name, type, parentId: normalizedParentId } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Organization unit created successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create organization unit"
    return { success: false, error: message }
  }
}

export async function updateOrgUnit(id: string, name: string, parentId?: string | null): Promise<ActionResult> {
  try {
    if (!name.trim()) return { success: false, error: "Name is required" }
    const normalizedParentId = normalizeParentId(parentId)
    const type = await resolveOrgType(normalizedParentId)
    await prisma.organizationUnit.update({ where: { id }, data: { name, type, parentId: normalizedParentId } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Organization unit updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update unit"
    return { success: false, error: message }
  }
}

export async function deleteOrgUnit(id: string): Promise<ActionResult> {
  try {
    await prisma.organizationUnit.delete({ where: { id } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Unit deleted successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete. Make sure this unit has no sub-units or employees."
    return { success: false, error: message }
  }
}

export async function createJobTitle(jobTitle: string, orgUnitId: string): Promise<ActionResult> {
  try {
    if (!jobTitle.trim()) return { success: false, error: "Job title is required" }
    await prisma.job.create({ data: { jobTitle, orgUnitId } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job title created successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create job title"
    return { success: false, error: message }
  }
}

export async function updateJobTitle(id: string, jobTitle: string, orgUnitId: string): Promise<ActionResult> {
  try {
    if (!jobTitle.trim()) return { success: false, error: "Job title is required" }
    await prisma.job.update({ where: { id }, data: { jobTitle, orgUnitId } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job title updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update job title"
    return { success: false, error: message }
  }
}

export async function deleteJobTitle(id: string): Promise<ActionResult> {
  try {
    await prisma.job.delete({ where: { id } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job title deleted successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete job title."
    return { success: false, error: message }
  }
}

export async function createJobLevel(levelName: string): Promise<ActionResult> {
  try {
    if (!levelName.trim()) return { success: false, error: "Level name is required" }
    await prisma.jobLevel.create({ data: { levelName } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job level created successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create job level"
    return { success: false, error: message }
  }
}

export async function updateJobLevel(id: string, levelName: string): Promise<ActionResult> {
  try {
    if (!levelName.trim()) return { success: false, error: "Level name is required" }
    await prisma.jobLevel.update({ where: { id }, data: { levelName } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job level updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update job level"
    return { success: false, error: message }
  }
}

export async function deleteJobLevel(id: string): Promise<ActionResult> {
  try {
    await prisma.jobLevel.delete({ where: { id } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Job level deleted successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete"
    return { success: false, error: message }
  }
}

export async function createEmploymentType(name: string): Promise<ActionResult> {
  try {
    if (!name.trim()) return { success: false, error: "Name is required" }
    await prisma.employmentType.create({ data: { name: name.trim() } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Employment type created successfully" }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { success: false, error: "Employment type already exists" }
    }
    const message = error instanceof Error ? error.message : "Failed to create employment type"
    return { success: false, error: message }
  }
}

export async function updateEmploymentType(id: string, name: string): Promise<ActionResult> {
  try {
    if (!name.trim()) return { success: false, error: "Name is required" }
    await prisma.employmentType.update({ where: { id }, data: { name } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Employment type updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update employment type"
    return { success: false, error: message }
  }
}

export async function deleteEmploymentType(id: string): Promise<ActionResult> {
  try {
    await prisma.employmentType.delete({ where: { id } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Employment type deleted successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete employment status."
    return { success: false, error: message }
  }
}

export async function createWorkSchedule(
  shiftName: string,
  checkInTime: string,
  checkOutTime: string,
  gracePeriod: number
): Promise<ActionResult> {
  try {
    await prisma.workSchedule.create({
      data: { shiftName, checkInTime, checkOutTime, gracePeriod: gracePeriod || 0 },
    })
    revalidatePath("/employees/settings")
    return { success: true, message: "Work schedule created successfully" }
  } catch (error: unknown) {
    return { success: false, error: "Failed to create schedule" }
  }
}

export async function updateWorkSchedule(
  id: string,
  shiftName: string,
  checkInTime: string,
  checkOutTime: string,
  gracePeriod: number
): Promise<ActionResult> {
  try {
    if (!shiftName.trim()) return { success: false, error: "Shift name is required" }
    await prisma.workSchedule.update({
      where: { id },
      data: { shiftName: shiftName.trim(), checkInTime, checkOutTime, gracePeriod: gracePeriod || 0 },
    })
    revalidatePath("/employees/settings")
    return { success: true, message: "Work schedule updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update work schedule"
    return { success: false, error: message }
  }
}

export async function deleteWorkSchedule(id: string): Promise<ActionResult> {
  try {
    await prisma.workSchedule.delete({ where: { id } })
    revalidatePath("/employees/settings")
    return { success: true, message: "Work schedule deleted successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete work schedule"
    return { success: false, error: message }
  }
}

export async function createComponentMaster(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const base = formData.get("base") as CalculationBase
  const defaultAmount = parseFloat(formData.get("defaultAmount") as string)
  const isTaxable = formData.get("isTaxable") === "true"
  const deductionType = (formData.get("deductionType") as string) || null
  const description = (formData.get("description") as string) || null
  const groupName = (formData.get("groupName") as string) || null

  if (!name || !category || !base || isNaN(defaultAmount)) {
    return { success: false, error: "All fields are required" }
  }

  try {
    await prisma.payrollComponentMaster.create({
      data: { name, category, base, defaultAmount, isTaxable, deductionType, description, groupName },
    })
    revalidatePath("/payroll/settings")
    return { success: true, message: "Component created successfully" }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create component"
    return { success: false, error: msg }
  }
}

export async function updateComponentMaster(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const base = formData.get("base") as CalculationBase
  const defaultAmount = parseFloat(formData.get("defaultAmount") as string)
  const isTaxable = formData.get("isTaxable") === "true"
  const deductionType = (formData.get("deductionType") as string) || null
  const description = (formData.get("description") as string) || null
  const groupName = (formData.get("groupName") as string) || null

  if (!id || !name || !category || !base || isNaN(defaultAmount)) {
    return { success: false, error: "All fields are required" }
  }

  try {
    await prisma.payrollComponentMaster.update({
      where: { id },
      data: { name, category, base, defaultAmount, isTaxable, deductionType, description, groupName },
    })
    revalidatePath("/payroll/settings")
    return { success: true, message: "Component updated successfully" }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update component"
    return { success: false, error: msg }
  }
}

export async function deleteComponentMaster(id: string | string[]): Promise<ActionResult> {
  try {
    await prisma.payrollComponentMaster.deleteMany({
      where: {
        id: typeof id === "string" ? id : { in: id },
      },
    })

    revalidatePath("/payroll/settings")
    return { success: true, message: "Component(s) deleted successfully" }
  } catch (err: unknown) {
    console.error("Delete Component Error:", err)
    const msg = err instanceof Error ? err.message : "Failed to delete component"
    return { success: false, error: msg }
  }
}

export async function bulkImportMasterComponent(
  rows: { name: string; category: string; base: string; defaultAmount: number; isTaxable: boolean; groupName: string; }[]
): Promise<ActionResult> {
  try {
    let createdCount = 0
    let skippedCount = 0

    for (const row of rows) {
      if (!row.name || !row.category || !row.base) {
        skippedCount++
        continue
      }

      const validBases = Object.values(CalculationBase) as string[]
      if (!validBases.includes(row.base.toUpperCase())) {
        skippedCount++
        continue
      }

      const existing = await prisma.payrollComponentMaster.findUnique({
        where: { name: row.name },
      })

      if (existing) {
        skippedCount++
        continue
      }

      await prisma.payrollComponentMaster.create({
        data: {
          name: row.name,
          category: row.category.toUpperCase(),
          base: row.base.toUpperCase() as CalculationBase,
          defaultAmount: row.defaultAmount || 0,
          isTaxable: row.isTaxable ?? true,
          groupName: row.groupName || null
        },
      })
      createdCount++
    }

    revalidatePath("/payroll/settings")
    return {
      success: true,
      message: `${createdCount} components imported, ${skippedCount} skipped`,
      count: createdCount,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bulk import failed"
    return { success: false, error: msg }
  }
}

interface SalaryConfigImportPayload {
  data: (string | number)[][]
  mapping: { field: string; index: number | null }[]
}

export async function importSalaryConfigs({
  data,
  mapping,
}: SalaryConfigImportPayload): Promise<ActionResult> {
  try {
    const getIdx = (field: string) => mapping.find((m) => m.field === field)?.index

    const idxNik      = getIdx("Employee ID (NIK)")
    const idxBasis    = getIdx("Employment Basis (MONTHLY/DAILY/etc)")
    const idxRate     = getIdx("Base Rate (Amount)")
    const idxEarnings = getIdx("Earnings (comma-separated names)")    
    const idxDeducts  = getIdx("Deductions (comma-separated names)")  

    if (idxNik === undefined || idxBasis === undefined || idxRate === undefined) {
      return { success: false, error: "Required mappings are missing" }
    }

    let createdCount = 0
    let skippedCount = 0

    for (const row of data) {
      const getRowValue = (idx: number | null | undefined) => {
        if (idx === null || idx === undefined) return null
        return row[idx] ?? null
      }

      const nik      = String(getRowValue(idxNik)   ?? "").trim()
      const basisRaw = String(getRowValue(idxBasis) ?? "").toUpperCase().trim()
      const rateRaw  = getRowValue(idxRate)

      if (!nik || !basisRaw || rateRaw === null) { skippedCount++; continue }

      const employee = await prisma.employee.findFirst({
        where: { employeeId: nik },
        select: { id: true },
      })
      if (!employee) { skippedCount++; continue }

      const validBases = Object.values(EmploymentBasis) as string[]
      if (!validBases.includes(basisRaw)) { skippedCount++; continue }

      const savedConfig = await prisma.salaryConfig.upsert({
        where:  { employeeId: employee.id },
        update: { basis: basisRaw as EmploymentBasis, baseRate: Number(rateRaw) },
        create: {
          employeeId: employee.id,
          basis:      basisRaw as EmploymentBasis,
          baseRate:   Number(rateRaw),
          ptkpStatus: "TK/0",
        },
      })

      const parseNames = (raw: unknown): string[] =>
        String(raw ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)

      const earningNames  = parseNames(getRowValue(idxEarnings))
      const deductNames   = parseNames(getRowValue(idxDeducts))
      const allNames      = [...earningNames, ...deductNames]

      if (allNames.length > 0) {
        const matchedMasters = await prisma.payrollComponentMaster.findMany({
          where: { name: { in: allNames } },
          select: { id: true, name: true },
        })

        const masterIdByName = new Map(matchedMasters.map((m) => [m.name, m.id]))

        for (const name of allNames) {
          const masterId = masterIdByName.get(name)
          if (!masterId) continue 

          const existing = await prisma.salaryComponentConfig.findFirst({
            where: { configId: savedConfig.id, masterId },
          })

          if (!existing) {
            await prisma.salaryComponentConfig.create({
              data: { configId: savedConfig.id, masterId, customAmount: null },
            })
          }
        }
      }

      createdCount++
    }

    revalidatePath("/payroll/settings")
    return {
      success: true,
      message: `${createdCount} salary configurations processed, ${skippedCount} skipped.`,
      count: createdCount,
    }
  } catch (error: unknown) {
    console.error("Bulk Salary Config Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import salary configurations",
    }
  }
}

export async function updateSalaryConfigById(formData: FormData): Promise<ActionResult> {
  const configId = formData.get("configId") as string
  const employeeId = formData.get("employeeId") as string
  const basis = formData.get("basis") as EmploymentBasis
  const baseRate = parseFloat(formData.get("baseRate") as string)
  const ptkpStatus = (formData.get("ptkpStatus") as string) || "TK/0"
  const initialComponentsRaw = formData.get("initialComponents") as string
  const initialComponentIds = initialComponentsRaw
    ? initialComponentsRaw.split(",").filter(Boolean)
    : []

  if (!employeeId || isNaN(baseRate)) {
    return { success: false, error: "Employee and Base Rate are required" }
  }

  try {
    if (configId) {
      await prisma.salaryConfig.update({
        where: { id: configId },
        data: { basis, baseRate, ptkpStatus },
      })
      revalidatePath("/payroll/settings")
      return { success: true, message: "Salary configuration updated" }
    } else {
      await prisma.$transaction(async (tx) => {
        const newConfig = await tx.salaryConfig.create({
          data: { employeeId, basis, baseRate, ptkpStatus },
        })
        if (initialComponentIds.length > 0) {
          await tx.salaryComponentConfig.createMany({
            data: initialComponentIds.map((masterId) => ({
              configId: newConfig.id,
              masterId,
              customAmount: null,
            })),
          })
        }
      })
      revalidatePath("/payroll/settings")
      return { success: true, message: "Salary initialized successfully" }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error occurred"
    return { success: false, error: msg }
  }
}

export async function assignComponentToConfig(
  configId: string,
  masterId: string,
  customAmount: number | null
): Promise<ActionResult> {
  try {
    const existing = await prisma.salaryComponentConfig.findFirst({
      where: { configId, masterId },
    })

    if (existing) {
      await prisma.salaryComponentConfig.update({
        where: { id: existing.id },
        data: { customAmount },
      })
    } else {
      await prisma.salaryComponentConfig.create({
        data: { configId, masterId, customAmount },
      })
    }

    revalidatePath("/payroll/settings")
    return { success: true, message: "Component assigned" }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to assign component"
    return { success: false, error: msg }
  }
}

export async function removeComponentFromConfig(
  configId: string,
  masterId: string
): Promise<ActionResult> {
  try {
    await prisma.salaryComponentConfig.deleteMany({ where: { configId, masterId } })
    revalidatePath("/payroll/settings")
    return { success: true, message: "Component removed successfully" }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to remove component"
    return { success: false, error: msg }
  }
}

export async function createLeaveType(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string
  const category = formData.get("category") as LeaveTypeCategory
  const defaultQuota = parseInt(formData.get("defaultQuota") as string) || 0
  const durationType = (formData.get("durationType") as string) || "FULL"
  const isPaid = formData.get("isPaid") === "on" || formData.get("isPaid") === "true"
  const requiresAttachment = formData.get("requiresAttachment") === "on" || formData.get("requiresAttachment") === "true"

  if (!name || !category) {
    return { success: false, error: "Name and Category are required" }
  }

  try {
    await prisma.leaveType.create({
      data: { 
        name, 
        category, 
        defaultQuota, 
        isPaid, 
        requiresAttachment, 
        durationType 
      },
    })
    revalidatePath("/leave/settings") 
    return { success: true, message: "Leave type created successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create leave type"
    return { success: false, error: message }
  }
}

export async function updateLeaveType(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const category = formData.get("category") as LeaveTypeCategory
  const defaultQuota = parseInt(formData.get("defaultQuota") as string) || 0
  const durationType = (formData.get("durationType") as string) || "FULL"
  
  const isPaid = formData.get("isPaid") === "on" || formData.get("isPaid") === "true"
  const requiresAttachment = formData.get("requiresAttachment") === "on" || formData.get("requiresAttachment") === "true"

  if (!id || !name || !category) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    await prisma.leaveType.update({
      where: { id },
      data: { name, category, defaultQuota, isPaid, requiresAttachment, durationType },
    })
    revalidatePath("/leave/settings")
    return { success: true, message: "Leave type updated successfully" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update leave type"
    return { success: false, error: message }
  }
}

export async function deleteLeaveType(id: string | string[]): Promise<ActionResult> {
  try {
    await prisma.leaveType.deleteMany({
      where: {
        id: typeof id === "string" ? id : { in: id },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Delete Leave Type Error:", error)
    return { 
      success: false, 
      error: "Failed to delete leave type(s). Ensure they aren't linked to existing balances." 
    }
  }
}

export async function bulkCreateLeaveTypes(
  data: { 
    name: string; 
    category: "PAID" | "UNPAID" | "SICK"; 
    defaultQuota: number; 
    isPaid: boolean; 
    requiresAttachment: boolean 
  }[]
): Promise<ActionResult> {
  try {
    const names = data.map(d => d.name)
    const existing = await prisma.leaveType.findMany({
      where: { name: { in: names } },
      select: { name: true }
    })
    const existingNames = new Set(existing.map(e => e.name))

    const finalData = data
      .filter(d => !existingNames.has(d.name))
      .map(d => ({
        name: d.name,
        category: d.category,
        defaultQuota: d.defaultQuota,
        isPaid: d.isPaid,
        requiresAttachment: d.requiresAttachment,
        durationType: "FULL" 
      }))

    if (finalData.length === 0) {
      return { success: true, message: "No new types to import", count: 0 }
    }

    const result = await prisma.leaveType.createMany({
      data: finalData,
      skipDuplicates: true
    })

    revalidatePath("/leave/settings")
    return { 
      success: true, 
      message: `${result.count} leave types imported successfully`,
      count: result.count 
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bulk import failed"
    return { success: false, error: message }
  }
}


export async function updateLeaveBalance(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string 
  const employeeId = formData.get("employeeId") as string
  const leaveTypeId = formData.get("leaveTypeId") as string
  const entitlement = parseInt(formData.get("entitlement") as string) || 0
  const year = parseInt(formData.get("year") as string) || new Date().getFullYear()
  const validFromStr = formData.get("validFrom") as string
  const validToStr = formData.get("validTo") as string

  try {
    if (!validFromStr || !validToStr) {
      return { success: false, error: "Validity dates are required" }
    }

    const validFrom = new Date(validFromStr)
    const validTo = new Date(validToStr)

    if (id) {
      const current = await prisma.leaveBalance.findUnique({
        where: { id },
        select: { taken: true }
      })
      if (!current) return { success: false, error: "Balance record not found" }

      await prisma.leaveBalance.update({
        where: { id },
        data: { 
          entitlement,
          year,
          remaining: entitlement - current.taken,
          validFrom,
          validTo
        }
      })
    } else {
      if (!employeeId || !leaveTypeId) return { success: false, error: "Employee and Leave Type are required" }
      
      await prisma.leaveBalance.create({
        data: {
          employeeId,
          leaveTypeId,
          entitlement,
          year,
          taken: 0,
          remaining: entitlement,
          validFrom,
          validTo
        }
      })
    }

    revalidatePath("/leave/settings")
    return { success: true, message: id ? "Balance updated" : "Balance assigned" }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { success: false, error: "This employee already has an entitlement for this leave type in this year" }
    }
    const message = error instanceof Error ? error.message : "Failed to process balance"
    return { success: false, error: message }
  }
}

interface BulkImportPayload {
  data: (string | number | Date)[][]
  mapping: ColumnMapping[]
}

export async function bulkCreateLeaveBalances({
  data,
  mapping,
}: BulkImportPayload): Promise<ImportResult> {
  try {
    const getIdx = (field: string) => mapping.find((m) => m.field === field)?.index

    const idxEmp = getIdx("Employee ID")
    const idxType = getIdx("Leave Type")
    const idxEnt = getIdx("Entitlement")
    const idxYear = getIdx("Year")
    const idxFrom = getIdx("Valid From")
    const idxTo = getIdx("Valid To")

    if (idxEmp === undefined || idxType === undefined || idxEnt === undefined) {
      return { success: false, error: "Required mappings are missing" }
    }

    let createdCount = 0

    for (const row of data) {
      const getRowValue = (idx: number | null | undefined) => {
        if (idx === null || idx === undefined) return null
        return row[idx] ?? null
      }

      const empIdentifier = String(getRowValue(idxEmp) ?? "").trim()
      const typeName = String(getRowValue(idxType) ?? "").trim()
      
      if (!empIdentifier || !typeName) continue

      const [employee, leaveType] = await Promise.all([
        prisma.employee.findFirst({
          where: { employeeId: empIdentifier },
          select: { id: true }
        }),
        prisma.leaveType.findFirst({
          where: { name: typeName },
          select: { id: true }
        })
      ])

      if (!employee || !leaveType) continue

      const entitlement = Number(getRowValue(idxEnt) ?? 0)
      const year = Number(getRowValue(idxYear) ?? new Date().getFullYear())

      const parseDate = (val: unknown): Date | null => {
        if (!val || val === "") return null
        const d = new Date(val as string | number | Date)
        return isNaN(d.getTime()) ? null : d
      }

      const validFrom = parseDate(getRowValue(idxFrom))
      const validTo = parseDate(getRowValue(idxTo))

      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: year,
          }
        },
        update: {
          entitlement,
          remaining: entitlement, 
          validFrom,
          validTo
        },
        create: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: year,
          entitlement,
          taken: 0,
          remaining: entitlement,
          validFrom,
          validTo
        }
      })

      createdCount++
    }

    revalidatePath("/leave/settings")
    return { success: true, count: createdCount }
  } catch (error: unknown) {
    console.error("Bulk Import Error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to import records" 
    }
  }
}

export async function deleteLeaveBalance(id: string | string[]): Promise<ActionResult> {
  try {
    const idsToDeleting = Array.isArray(id) ? id : [id];

    if (idsToDeleting.length === 0) {
      return { success: false, error: "No records selected for deletion" };
    }

    await prisma.leaveBalance.deleteMany({
      where: {
        id: { in: idsToDeleting },
      },
    });

    revalidatePath("/leave/settings"); 

    return { 
      success: true, 
      message: `${idsToDeleting.length} balance record(s) deleted successfully.` 
    };
  } catch (error: unknown) {
    console.error("Delete Leave Balance Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete records" 
    };
  }
}