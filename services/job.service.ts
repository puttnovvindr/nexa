import { prisma } from "@/lib/prisma";

export const JobService = {
  async getAllUnits() {
    return await prisma.organizationUnit.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { jobs: true } } } 
    });
  },

  async createUnit(name: string) {
    return await prisma.organizationUnit.create({
      data: { 
        name,
        type: "DEPARTMENT" 
      }
    });
  },

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
        jobLevels: {
          create: data.levels.map(levelName => ({
            levelName: levelName
          }))
        }
      }
    });
  }
};