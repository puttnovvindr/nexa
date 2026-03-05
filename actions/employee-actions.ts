"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { ImportEmployeesPayload, ImportResult } from "@/types/employee"

export async function saveManualEmployee(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const employeeId = formData.get("employeeId") as string
  const email = formData.get("email") as string
  const jobId = formData.get("jobId") as string
  const jobLevelId = formData.get("jobLevelId") as string
  const employmentTypeId = formData.get("employmentTypeId") as string

  if (!fullName || !employeeId || !jobId || !jobLevelId || !employmentTypeId) {
    return { success: false, error: "Missing required fields." }
  }

  try {
    await prisma.employee.create({
      data: {
        fullName,
        employeeId,
        email,
        jobId,
        jobLevelId,
        employmentTypeId,
        status: "ACTIVE",
        joinDate: new Date(),
      }
    })

    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Save Error:", error)
    return { success: false, error: "Failed to save. Check if Employee ID already exists." }
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  const fullName = formData.get("fullName") as string
  const employeeId = formData.get("employeeId") as string
  const email = formData.get("email") as string
  const jobId = formData.get("jobId") as string
  const jobLevelId = formData.get("jobLevelId") as string
  const employmentTypeId = formData.get("employmentTypeId") as string

  try {
    await prisma.employee.update({
      where: { id },
      data: {
        fullName,
        employeeId,
        email,
        jobId,
        jobLevelId,
        employmentTypeId
      }
    })

    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update employee details." }
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({
      where: { id }
    })
    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete employee." }
  }
}

export async function importEmployees({ 
  data, 
  mapping 
}: ImportEmployeesPayload): Promise<ImportResult> {
  try {
    const [masterJobs, masterLevels, masterTypes] = await Promise.all([
      prisma.job.findMany(),
      prisma.jobLevel.findMany(),
      prisma.employmentType.findMany()
    ]);

    if (masterJobs.length === 0 || masterLevels.length === 0 || masterTypes.length === 0) {
      return { success: false, error: "Master data (Jobs/Levels/Types) is empty." };
    }

    const employeesToProcess: Prisma.EmployeeUpsertArgs[] = [];

    for (const row of data) {
      const getVal = (fieldName: string): string => {
        const m = mapping.find(item => item.field === fieldName);
        return m?.index !== null ? String(row[m!.index!] ?? "").trim() : "";
      };

      const employeeId = getVal("Employee ID (NIK)");
      
      if (!employeeId) continue;

      const jobTitleExcel = getVal("Job Title");
      const jobLevelExcel = getVal("Level");
      const empTypeExcel = getVal("Status");

      const matchedJob = masterJobs.find(j => j.jobTitle.toLowerCase() === jobTitleExcel.toLowerCase());
      const matchedLevel = masterLevels.find(l => l.levelName.toLowerCase() === jobLevelExcel.toLowerCase());
      const matchedType = masterTypes.find(t => t.name.toLowerCase() === empTypeExcel.toLowerCase());

      const jobId = matchedJob?.id || masterJobs[0].id;
      const jobLevelId = matchedLevel?.id || masterLevels[0].id;
      const employmentTypeId = matchedType?.id || masterTypes[0].id;

      employeesToProcess.push({
        where: { employeeId: employeeId }, 
        update: {
          fullName: getVal("Full Name"),
          email: getVal("Email"),
          jobId,
          jobLevelId,
          employmentTypeId,
        },
        create: {
          fullName: getVal("Full Name"),
          employeeId: employeeId,
          email: getVal("Email"),
          status: "ACTIVE",
          joinDate: new Date(),
          jobId,
          jobLevelId,
          employmentTypeId,
        }
      });
    }

    await prisma.$transaction(
      employeesToProcess.map((item) => prisma.employee.upsert(item))
    );

    revalidatePath("/employees");
    return { success: true, count: employeesToProcess.length };

  } catch (error) {
    console.error("Bulk Import Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred during import." 
    };
  }
}