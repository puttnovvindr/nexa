import { prisma } from "@/lib/prisma";

export const JobService = {
  // --- UNIT / DEPARTMENT LOGIC ---
  
  async getAllUnits() {
    return await prisma.organizationUnit.findMany({
      orderBy: { name: 'asc' },
      // Include jobs kalau nanti mau nampilin jumlah jabatan per unit
      include: { _count: { select: { jobs: true } } } 
    });
  },

  async createUnit(name: string) {
    return await prisma.organizationUnit.create({
      data: { 
        name,
        type: "DEPARTMENT" // Tambahin ini karena di schema lo 'type' itu wajib
      }
    });
  },

  // --- JOB & LEVEL LOGIC ---

  async getAllJobs() {
    return await prisma.job.findMany({
      include: {
        orgUnit: true,
        jobLevels: true,
      },
      orderBy: { jobTitle: 'asc' }
    });
  },

  async createJobWithLevels(data: { jobTitle: string; orgUnitId: string; levels: string[] }) {
    return await prisma.job.create({
      data: {
        jobTitle: data.jobTitle,
        orgUnitId: data.orgUnitId,
        // Ini cara sakti Prisma buat simpan ke 2 tabel sekaligus (Job & JobLevel)
        jobLevels: {
          create: data.levels.map(levelName => ({
            levelName: levelName
          }))
        }
      }
    });
  }
};