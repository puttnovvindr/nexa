"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createOrgUnit(name: string, parentId?: string | null) {
  try {
    let type = "Head Office"
    if (parentId && parentId !== "none") {
      const parent = await prisma.organizationUnit.findUnique({
        where: { id: parentId }
      })
      type = parent?.parentId ? "Division" : "Department"
    }

    await prisma.organizationUnit.create({
      data: { 
        name, 
        type,
        parentId: parentId === "none" ? null : parentId 
      }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create organization unit" }
  }
}

export async function updateOrgUnit(id: string, name: string, parentId?: string | null) {
  try {
    let type = "Head Office"
    if (parentId && parentId !== "none") {
      const parent = await prisma.organizationUnit.findUnique({
        where: { id: parentId }
      })
      type = parent?.parentId ? "Division" : "Department"
    }

    await prisma.organizationUnit.update({
      where: { id },
      data: { 
        name, 
        type,
        parentId: parentId === "none" ? null : parentId 
      }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update unit." }
  }
}

export async function deleteOrgUnit(id: string) {
  try {
    await prisma.organizationUnit.delete({
      where: { id }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete. Make sure this unit has no sub-units or employees." }
  }
}

export async function createJobTitle(jobTitle: string, orgUnitId: string) {
  try {
    await prisma.job.create({
      data: { jobTitle, orgUnitId }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create job title" }
  }
}

export async function updateJobTitle(id: string, jobTitle: string, orgUnitId: string) {
  try {
    await prisma.job.update({
      where: { id },
      data: { jobTitle, orgUnitId }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update job title" }
  }
}

export async function deleteJobTitle(id: string) {
  try {
    await prisma.job.delete({ where: { id } })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete job title." }
  }
}

export async function createJobLevel(levelName: string) {
  try {
    return await prisma.jobLevel.create({ 
      data: { levelName } 
    }).then(() => {
      revalidatePath("/settings")
      return { success: true }
    })
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create job level" }
  }
}

export async function updateJobLevel(id: string, levelName: string) {
  try {
    await prisma.jobLevel.update({
      where: { id },
      data: { levelName }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update job level" }
  }
}

export async function deleteJobLevel(id: string) {
  try {
    await prisma.jobLevel.delete({ where: { id } })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete" }
  }
}

export async function createEmploymentType(name: string) {
  try {
    await prisma.employmentType.create({ data: { name } })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create employment type" }
  }
}

export async function updateEmploymentType(id: string, name: string) {
  try {
    await prisma.employmentType.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update employment type" }
  }
}

export async function deleteEmploymentType(id: string) {
  try {
    await prisma.employmentType.delete({ where: { id } })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete employment status." }
  }
}