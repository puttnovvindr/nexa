import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"
import OrgUnitTab from "@/components/settings/OrgUnitTab"
import JobTitleTab from "@/components/settings/JobTitleTab"
import JobLevelTab from "@/components/settings/JobLevelTab"
import EmploymentTypeTab from "@/components/settings/EmploymentTypeTab"

export default async function EmployeeConfigurationPage() {
  const [units, jobs, levels, types] = await Promise.all([
    prisma.organizationUnit.findMany({ 
      include: { parent: true }, 
      orderBy: { name: 'asc' } 
    }),
    prisma.job.findMany({ 
      include: { orgUnit: true }, 
      orderBy: { jobTitle: 'asc' } 
    }),
    prisma.jobLevel.findMany({ 
      orderBy: { levelName: 'asc' } 
    }),
    prisma.employmentType.findMany({ 
      orderBy: { name: 'asc' } 
    })
  ])

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen rounded-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Employee Configurations</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Manage organization structure, job titles, job levels and employment types
        </p>
      </div>

      <Tabs defaultValue="org" className="w-full space-y-6 flex items-center">
        <div className="w-full"> 
          <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 p-1 rounded-lg h-11 border border-gray-200/50 flex items-center">
            <TabsTrigger 
              value="org" 
              className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Org Units
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Job Titles
            </TabsTrigger>
            <TabsTrigger 
              value="levels" 
              className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Job Levels
            </TabsTrigger>
            <TabsTrigger 
              value="types" 
              className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Employment Types
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="org">
            <OrgUnitTab data={units} />
          </TabsContent>
          <TabsContent value="jobs">
            <JobTitleTab data={jobs} orgUnits={units} />
          </TabsContent>
          <TabsContent value="levels">
            <JobLevelTab data={levels} />
          </TabsContent>
          <TabsContent value="types">
            <EmploymentTypeTab data={types} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}