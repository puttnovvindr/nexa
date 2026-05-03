"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Layers, Briefcase, BarChart4, ClipboardCheck, Clock } from "lucide-react"
import { OrganizationUnit, JobLevel, EmploymentType, WorkSchedule } from "@prisma/client"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteDialog } from "@/components/data-table/delete-dialog"
import { useCrudHandler } from "@/hooks/use-crud-handler"
import { useDuplicateValidator } from "@/hooks/use-duplicate-validator"
import { SettingTabCard } from "./SettingTabCard"
import { TableSearch } from "@/components/data-table/table-search"
import { TableAddButton } from "@/components/data-table/table-add-button"
import { OrgUnitTable } from "./org-unit/OrgUnitTable"
import { OrgUnitStats } from "./org-unit/OrgUnitStats"
import { OrgUnitControls } from "./org-unit/OrgUnitControls"
import { OrgUnitDistribution } from "./org-unit/OrgUnitDistribution"
import { OrgUnitInsights } from "./org-unit/OrgUnitInsights"
import { JobTitleTable } from "./job-title/JobTitleTable"
import { JobTitleStats } from "./job-title/JobTitleStats"
import { JobTitleControls } from "./job-title/JobTitleControls"
import { JobLevelTable } from "./job-level/JobLevelTable"
import { JobLevelStats } from "./job-level/JobLevelStats"
import { JobLevelControls } from "./job-level/JobLevelControls"
import { EmploymentTypeTable } from "./employment-type/EmploymentTypeTable"
import { EmploymentTypeStats } from "./employment-type/EmploymentTypeStats"
import { EmploymentTypeControls } from "./employment-type/EmploymentTypeControls"
import { WorkScheduleTable } from "./work-schedule/WorkScheduleTable"
import { WorkScheduleControls } from "./work-schedule/WorkScheduleControls"
import { WorkScheduleStats } from "./work-schedule/WorkScheduleStats"
import { OrgUnitWithParent } from "@/types/settings"
import { EmployeeWithRelations, JobWithDetails } from "@/types/employee"

import { 
  createOrgUnit, updateOrgUnit, deleteOrgUnit,
  createJobTitle, updateJobTitle, deleteJobTitle,
  createJobLevel, updateJobLevel, deleteJobLevel,
  createEmploymentType, updateEmploymentType, deleteEmploymentType,
  createWorkSchedule, updateWorkSchedule, deleteWorkSchedule
} from "@/actions/settings-actions"

type OrgWithAnalytics = OrgUnitWithParent & { _count?: { employees: number } }
type SafeOrgUnit = OrgUnitWithParent & { [key: string]: unknown }

interface Props {
  data: EmployeeWithRelations[]
  units?: SafeOrgUnit[]
  jobs?: JobWithDetails[]
  jobLevels?: JobLevel[]
  employmentTypes?: EmploymentType[]
  workSchedules?: WorkSchedule[]
}

export default function EmployeeSettingsClient({ 
  units = [], 
  jobs = [],
  jobLevels = [],
  employmentTypes = [],
  workSchedules = []
}: Props) {

  const {
    isPending,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    deleteOpen,
    setDeleteOpen,
    isDeleting,
    handleAction,
    openDelete,
    confirmDelete,
  } = useCrudHandler()

  const [activeTab, setActiveTab] = useState("org")
  const [orgSearch, setOrgSearch] = useState("")
  const [openAddOrg, setOpenAddOrg] = useState(false)
  const [editingUnit, setEditingUnit] = useState<SafeOrgUnit | null>(null)
  const [jobSearch, setJobSearch] = useState("")
  const [openAddJob, setOpenAddJob] = useState(false)
  const [editingJob, setEditingJob] = useState<JobWithDetails | null>(null)
  const [levelSearch, setLevelSearch] = useState("")
  const [openAddLevel, setOpenAddLevel] = useState(false)
  const [editingLevel, setEditingLevel] = useState<JobLevel | null>(null)
  const [typeSearch, setTypeSearch] = useState("")
  const [openAddType, setOpenAddType] = useState(false)
  const [editingType, setEditingType] = useState<EmploymentType | null>(null)
  const [scheduleSearch, setScheduleSearch] = useState("")
  const [openAddSchedule, setOpenAddSchedule] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null)
  const { isDuplicate } = useDuplicateValidator()

  const filteredUnits = useMemo(
    () => units.filter(u => u.name.toLowerCase().includes(orgSearch.toLowerCase())),
    [units, orgSearch]
  )

  const filteredJobs = useMemo(
    () =>
      jobs
        .map(j => ({ ...j, orgUnitName: j.orgUnit?.name || "" }))
        .filter(j => j.jobTitle.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobs, jobSearch]
  )

  const filteredLevels = useMemo(
    () => jobLevels.filter(l => l.levelName.toLowerCase().includes(levelSearch.toLowerCase())),
    [jobLevels, levelSearch]
  )

  const filteredTypes = useMemo(
    () => employmentTypes.filter(t => t.name.toLowerCase().includes(typeSearch.toLowerCase())),
    [employmentTypes, typeSearch]
  )

  const filteredSchedules = useMemo(
    () => workSchedules.filter(s => s.shiftName.toLowerCase().includes(scheduleSearch.toLowerCase())),
    [workSchedules, scheduleSearch]
  )

  return (
    <div className="h-full w-full flex flex-col font-poppins overflow-hidden">

      <div className="flex-1 flex flex-col overflow-hidden gap-6">
        <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 text-white">
          <h1 className="text-[16px] font-bold uppercase tracking-tight">Employee Settings</h1>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Manage organizational structure and roles
          </p>
        </div>

        <Tabs defaultValue="org" onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">

          <TabsList className="bg-slate-100/60 p-1 rounded-full border border-slate-200/50 shrink-0 w-full">
            <SettingTabCard value="org" label="Org Units" icon={Layers} />
            <SettingTabCard value="jobs" label="Job Titles" icon={Briefcase} />
            <SettingTabCard value="levels" label="Job Levels" icon={BarChart4} />
            <SettingTabCard value="types" label="Employment Types" icon={ClipboardCheck} />
            <SettingTabCard value="schedules" label="Work Schedules" icon={Clock} />
          </TabsList>

          <div className="flex-1 flex min-h-0 overflow-hidden mt-4">

            <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
              <TabsContent value="org" className="flex-1 flex flex-col gap-6">
                <OrgUnitStats data={units as unknown as OrgWithAnalytics[]} />

                <div className="flex items-center justify-between">
                  <TableSearch value={orgSearch} onChange={setOrgSearch} placeholder="Search unit..." />
                  <TableAddButton label="Add Unit" onClick={() => setOpenAddOrg(true)} icon={Layers} />
                </div>

                <OrgUnitTable
                  data={filteredUnits}
                  isPending={isPending}
                  onEdit={setEditingUnit}
                  onDelete={(id) => openDelete(id, deleteOrgUnit, "Unit deleted")}
                  onToggleSort={() => {}}
                />
              </TabsContent>

              <TabsContent value="jobs" className="flex-1 flex flex-col gap-6">
                <JobTitleStats data={jobs} />

                <div className="flex items-center justify-between">
                  <TableSearch
                    value={jobSearch}
                    onChange={setJobSearch}
                    placeholder="Search position..."
                  />

                  <TableAddButton
                    label="Add Position"
                    onClick={() => setOpenAddJob(true)}
                    icon={Briefcase}
                  />
                </div>

                <JobTitleTable
                  data={filteredJobs}
                  isPending={isPending}
                  onToggleSort={() => {}}
                  onEdit={setEditingJob}
                  onDelete={(id) => openDelete(id, deleteJobTitle, "Job deleted")}
                />
              </TabsContent>

              <TabsContent value="levels" className="flex-1 flex flex-col gap-6">
                <JobLevelStats data={jobLevels} />

                <div className="flex items-center justify-between">
                  <TableSearch
                    value={levelSearch}
                    onChange={setLevelSearch}
                    placeholder="Search level..."
                  />

                  <TableAddButton
                    label="Add Level"
                    onClick={() => setOpenAddLevel(true)}
                    icon={BarChart4}
                  />
                </div>

                <JobLevelTable
                  data={filteredLevels}
                  isPending={isPending}
                  onToggleSort={() => {}}
                  onEdit={setEditingLevel}
                  onDelete={(id) => openDelete(id, deleteJobLevel, "Level deleted")}
                />
              </TabsContent>

              <TabsContent value="types" className="flex-1 flex flex-col gap-6">
                <EmploymentTypeStats data={employmentTypes} />

                <div className="flex items-center justify-between">
                  <TableSearch
                    value={typeSearch}
                    onChange={setTypeSearch}
                    placeholder="Search type..."
                  />

                  <TableAddButton
                    label="Add Type"
                    onClick={() => setOpenAddType(true)}
                    icon={Layers}
                  />
                </div>

                <EmploymentTypeTable
                  data={filteredTypes}
                  isPending={isPending}
                  onToggleSort={() => {}}
                  onEdit={setEditingType}
                  onDelete={(id) => openDelete(id, deleteEmploymentType, "Type deleted")}
                />
              </TabsContent>

              <TabsContent value="schedules" className="flex-1 flex flex-col gap-6 overflow-hidden">
                <WorkScheduleStats data={workSchedules} />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-sm">
                    <TableSearch
                      value={scheduleSearch}
                      onChange={setScheduleSearch}
                      placeholder="Search shift name..."
                    />
                  </div>

                  <TableAddButton
                    label="Add Schedule"
                    onClick={() => setOpenAddSchedule(true)}
                    icon={Clock}
                  />
                </div>
                
                <WorkScheduleTable
                  data={filteredSchedules} 
                  isPending={isPending}
                  onToggleSort={() => {}} 
                  onEdit={setEditingSchedule}
                  onDelete={(id) => openDelete(id, deleteWorkSchedule, "Schedule deleted successfully")}
                />
              
              </TabsContent>

            </div>

            {activeTab === "org" && (
              <aside className="w-[320px] hidden xl:flex flex-col gap-6 pl-4">
                <OrgUnitDistribution data={units as unknown as OrgWithAnalytics[]} />
                <OrgUnitInsights data={units as unknown as OrgWithAnalytics[]} />
              </aside>
            )}

          </div>
        </Tabs>
      </div>

      <OrgUnitControls
        open={openAddOrg || !!editingUnit}
        onOpenChange={(val) => {
          setOpenAddOrg(val)
          if (!val) setEditingUnit(null)
        }}
        editingData={editingUnit}
        units={units}
        isPending={isPending}
        onSubmit={(e) => {
          e.preventDefault()

          const formData = new FormData(e.currentTarget)

          const name = String(formData.get("name") || "").trim()
          const parentId =
            formData.get("parentId") === "root"
              ? null
              : String(formData.get("parentId"))

          if (!name) {
            return handleAction(
              Promise.resolve({ success: false, error: "Unit name is required" }),
              ""
            )
          }

          if (!editingUnit && isDuplicate(units, name, "name")) {
            return handleAction(
              Promise.resolve({ success: false, error: "Unit already exists" }),
              ""
            )
          }

          handleAction(
            editingUnit
              ? updateOrgUnit(editingUnit.id, name, parentId)
              : createOrgUnit(name, parentId),
            editingUnit ? "Unit updated" : "Unit created",
            () => {
              setOpenAddOrg(false)
              setEditingUnit(null)
            }
          )
        }}
      />

      <JobTitleControls
        open={openAddJob || !!editingJob}
        onOpenChange={(val) => {
          setOpenAddJob(val)
          if (!val) setEditingJob(null)
        }}
        editingData={editingJob}
        orgUnits={units}
        isPending={isPending}
        onSubmit={(e) => {
          e.preventDefault()

          const formData = new FormData(e.currentTarget)

          const jobTitle = String(formData.get("jobTitle") || "").trim()
          const orgUnitId = String(formData.get("orgUnitId") || "")

          if (!jobTitle) {
            return handleAction(
              Promise.resolve({ success: false, error: "Job title is required" }),
              ""
            )
          }

          if (!orgUnitId) {
            return handleAction(
              Promise.resolve({ success: false, error: "Org unit is required" }),
              ""
            )
          }

          if (!editingJob && isDuplicate(jobs, jobTitle, "jobTitle")) {
            return handleAction(
              Promise.resolve({ success: false, error: "Job title already exists" }),
              ""
            )
          }

          handleAction(
            editingJob
              ? updateJobTitle(editingJob.id, jobTitle, orgUnitId)
              : createJobTitle(jobTitle, orgUnitId),
            editingJob ? "Job updated" : "Job created",
            () => {
              setOpenAddJob(false)
              setEditingJob(null)
            }
          )
        }}
      />

      <JobLevelControls
        open={openAddLevel || !!editingLevel}
        onOpenChange={(val) => {
          setOpenAddLevel(val)
          if (!val) setEditingLevel(null)
        }}
        editingData={editingLevel}
        isPending={isPending}
        onSubmit={(e) => {
          e.preventDefault()

          const formData = new FormData(e.currentTarget)
          const levelName = String(formData.get("levelName") || "").trim()

          if (!levelName) {
            return handleAction(
              Promise.resolve({ success: false, error: "Level name is required" }),
              ""
            )
          }

          if (!editingLevel && isDuplicate(jobLevels, levelName, "levelName")) {
            return handleAction(
              Promise.resolve({ success: false, error: "Level already exists" }),
              ""
            )
          }

          handleAction(
            editingLevel
              ? updateJobLevel(editingLevel.id, levelName)
              : createJobLevel(levelName),
            editingLevel ? "Level updated" : "Level created",
            () => {
              setOpenAddLevel(false)
              setEditingLevel(null)
            }
          )
        }}
      />

      <EmploymentTypeControls
        open={openAddType || !!editingType}
        onOpenChange={(val) => {
          setOpenAddType(val)
          if (!val) setEditingType(null)
        }}
        editingData={editingType}
        isPending={isPending}
        onSubmit={(e) => {
          e.preventDefault()

          const formData = new FormData(e.currentTarget)
          const name = String(formData.get("name") || "").trim()

          if (!name) {
            return handleAction(
              Promise.resolve({ success: false, error: "Type name is required" }),
              ""
            )
          }

          if (!editingType && isDuplicate(employmentTypes, name, "name")) {
            return handleAction(
              Promise.resolve({ success: false, error: "Type already exists" }),
              ""
            )
          }

          handleAction(
            editingType
              ? updateEmploymentType(editingType.id, name)
              : createEmploymentType(name),
            editingType ? "Type updated" : "Type created",
            () => {
              setOpenAddType(false)
              setEditingType(null)
            }
          )
        }}
      />

      <WorkScheduleControls
        open={openAddSchedule || !!editingSchedule}
        onOpenChange={(val) => {
          setOpenAddSchedule(val)
          if (!val) setEditingSchedule(null)
        }}
        editingData={editingSchedule}
        isPending={isPending}
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const shiftName = String(formData.get("shiftName") || "").trim()
          const checkInTime = String(formData.get("checkInTime"))
          const checkOutTime = String(formData.get("checkOutTime"))
          const gracePeriod = Number(formData.get("gracePeriod") || 0)

          handleAction(
            editingSchedule
              ? updateWorkSchedule(editingSchedule.id, shiftName, checkInTime, checkOutTime, gracePeriod)
              : createWorkSchedule(shiftName, checkInTime, checkOutTime, gracePeriod),
            editingSchedule ? "Schedule updated" : "Schedule created",
            () => {
              setOpenAddSchedule(false)
              setEditingSchedule(null)
            }
          )
        }}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />

      <StatusDialog
        open={statusOpen}
        success={statusSuccess}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
    </div>
  )
}