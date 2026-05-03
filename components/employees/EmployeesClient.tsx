"use client"

import { useState } from "react"
import Link from "next/link"
import { EmployeeWithRelations, JobWithDetails } from "@/types/employee"
import { EmploymentType, JobLevel, WorkSchedule, OrganizationUnit } from "@prisma/client"
import { TableSearch } from "@/components/data-table/table-search"
import { TableFilter } from "@/components/data-table/table-filter"
import { Button } from "@/components/ui/button"
import { Settings2, Users } from "lucide-react"

// Import Components
import ImportEmployeeModal from "./ImportEmployeesModal"
import EmployeeTable from "./EmployeesTable"
import { EmployeeStats } from "./EmployeeStats"
import { EmployeeDistribution } from "./EmployeeDistribution" 
import { EmployeeDataHealth } from "./EmployeeDataHealth"

interface EmployeesClientProps {
  data: EmployeeWithRelations[]
  orgUnits: OrganizationUnit[]
  jobs: JobWithDetails[]
  jobLevels: JobLevel[]
  employmentTypes: EmploymentType[]
  workSchedules: WorkSchedule[]
}

export default function EmployeesClient({
  data,
  orgUnits,
  jobs,
  jobLevels,
  employmentTypes,
  workSchedules,
}: EmployeesClientProps) {
  const [search, setSearch] = useState("")
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])

  return (
    <div className="h-full w-full flex flex-col font-poppins overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden gap-6">
        <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 shadow-lg shadow-purple-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-5 -mt-5" />
          
          <div className="relative z-10 flex items-center">
            <div className="flex flex-col">
              <h1 className="text-[16px] font-bold tracking-tight text-white uppercase">
                Employee Management
              </h1>
              <p className="text-white/80 text-[12px] font-medium leading-tight mt-0.5">
                Manage your team members, monitor distribution, and track office milestones
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          <div className="flex-1 min-w-0 flex flex-col space-y-6 overflow-hidden">
            <div className="shrink-0">
              <EmployeeStats data={data} />
            </div>

            <div className="flex w-full justify-between items-center gap-4 shrink-0">
              <TableSearch value={search} onChange={setSearch} placeholder="Search employee..." />
              
              <div className="flex items-center gap-3">
                <TableFilter 
                  categories={[
                    {
                      id: "department",
                      label: "Department",
                      options: orgUnits.map(u => ({ id: u.name, label: u.name })),
                      selectedValues: selectedDepts,
                      onUpdate: setSelectedDepts
                    },
                    {
                      id: "jobTitle",
                      label: "Job Title",
                      options: jobs.map(j => ({ id: j.id, label: j.jobTitle })),
                      selectedValues: selectedTitles,
                      onUpdate: setSelectedTitles
                    }
                  ]}
                />

                <Link href="/employees/settings">
                  <Button 
                    variant="outline" 
                    className="h-10 px-5 rounded-sm border-gray-200 text-gray-500 hover:text-[#1E293B] hover:bg-gray-100 transition-all font-semibold text-[12px] gap-2 shadow-none cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4 text-gray-400" />
                    Configuration
                  </Button>
                </Link>
                
                <ImportEmployeeModal 
                  orgUnits={orgUnits}
                  jobs={jobs} 
                  jobLevels={jobLevels} 
                  employmentTypes={employmentTypes} 
                  workSchedules={workSchedules}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              <EmployeeTable 
                data={data}
                orgUnits={orgUnits}
                jobs={jobs}
                jobLevels={jobLevels}
                employmentTypes={employmentTypes}
                workSchedules={workSchedules}
                search={search}
                selectedDepts={selectedDepts}
                selectedTitles={selectedTitles}
              />
            </div>
          </div>

          <aside className="w-[320px] shrink-0 hidden xl:flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar ">
            <div className="flex flex-col gap-6">
              <EmployeeDistribution data={data} jobLevels={jobLevels} employmentTypes={employmentTypes}/>
              <EmployeeDataHealth data={data} />
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}