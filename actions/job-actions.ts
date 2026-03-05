"use server"

import { JobService } from "@/services/job.service";
import { revalidatePath } from "next/cache";

export async function createJobAction(formData: FormData) {
  const levelsRaw = formData.get("levels") as string;
  const levelsArray = levelsRaw.split(",").map(l => l.trim());

  await JobService.createJobWithLevels({
    jobTitle: formData.get("jobTitle") as string,
    orgUnitId: formData.get("orgUnitId") as string,
    levels: levelsArray
  });

  revalidatePath("/employees/jobs");
}

export async function createUnitAction(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name) return { success: false, error: "Nama departemen wajib diisi" };

  try {
    await JobService.createUnit(name);
    revalidatePath("/employees/units");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menambah departemen" };
  }
}