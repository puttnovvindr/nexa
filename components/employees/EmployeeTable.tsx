"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { deleteEmployee, updateEmployee } from "@/actions/employee-actions"
import { EmployeeWithRelations, JobWithDetails } from "@/types/employee"
import { EmploymentType, JobLevel } from "@prisma/client" 

import { useDataTable } from "@/hooks/use-data-table"
import { TableSearch } from "@/components/data-table/table-search"
import { TablePagination } from "@/components/data-table/table-pagination"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableFilter } from "@/components/data-table/table-filter"
import { TableContainer } from "@/components/data-table/table-container"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { EntryDialog } from "@/components/data-table/entry-dialog"

import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ImportEmployeeModal from "./ImportEmployeeModal"
import ManualImportForm from "./ManualImportForm"

interface EmployeeTableProps {
  data: EmployeeWithRelations[]
  jobs: JobWithDetails[]
  jobLevels: JobLevel[] 
  employmentTypes: EmploymentType[]
}

type FlattenedEmployee = EmployeeWithRelations & {
  deptName: string; 
  jobTitleName: string; 
  levelName: string; 
  statusName: string; 
  [key: string]: unknown 
}

type EmployeeSortKey = "fullName" | "employeeId" | "deptName" | "jobTitleName" | "levelName" | "statusName"

export default function EmployeeTable({ data, jobs, jobLevels, employmentTypes }: EmployeeTableProps) {
  const router = useRouter()
  
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<FlattenedEmployee | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const flattenedData = useMemo(() => {
    return data.map((emp): FlattenedEmployee => ({
      ...emp,
      deptName: emp.job?.orgUnit?.name || "N/A",
      jobTitleName: emp.job?.jobTitle || "N/A",
      levelName: emp.jobLevel?.levelName || "N/A",
      statusName: emp.employmentType?.name || emp.status || "N/A"
    }))
  }, [data])

  const filteredData = useMemo(() => {
    return flattenedData.filter(emp => {
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(emp.deptName)
      const matchesTitle = selectedTitles.length === 0 || selectedTitles.includes(emp.jobId)
      return matchesDept && matchesTitle
    })
  }, [flattenedData, selectedDepts, selectedTitles])

  const { 
    search, setSearch, 
    paginatedData, 
    currentPage, setCurrentPage, 
    totalPages, 
    toggleSort 
  } = useDataTable<FlattenedEmployee, EmployeeSortKey>({ 
      data: filteredData, 
      searchKey: "fullName", 
      initialSortKey: "fullName" 
  })

  const deptOptions = useMemo(() => {
    const names = Array.from(new Set(data.map(e => e.job?.orgUnit?.name).filter(Boolean)))
    return names.map(name => ({ id: name as string, label: name as string }))
  }, [data])

  const jobOptions = useMemo(() => {
    return jobs.map(j => ({ id: j.id, label: j.jobTitle }))
  }, [jobs])

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingEmployee) return
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateEmployee(editingEmployee.id, formData)
      if (result.success) {
        setAlertConfig({ open: true, success: true, message: "Employee updated successfully!" })
        setEditingEmployee(null)
        router.refresh()
      } else {
        setAlertConfig({ open: true, success: false, message: result.error || "Update failed" })
      }
    } catch {
      setAlertConfig({ open: true, success: false, message: "Something went wrong" })
    } finally { setIsPending(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsPending(true)
    try {
      const result = await deleteEmployee(deleteId)
      if (result.success) {
        setAlertConfig({ open: true, success: true, message: "Employee deleted successfully!" })
        setDeleteId(null)
        router.refresh()
      }
    } catch {
      setAlertConfig({ open: true, success: false, message: "Failed to delete" })
    } finally { setIsPending(false) }
  }

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex w-full justify-between items-center gap-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search employee..." />
        <div className="flex items-center gap-2">
          <TableFilter label="Department" options={deptOptions} selectedValues={selectedDepts} onUpdate={setSelectedDepts} />
          <TableFilter label="Job Title" options={jobOptions} selectedValues={selectedTitles} onUpdate={setSelectedTitles} />
          
          <ImportEmployeeModal 
            jobs={jobs} 
            jobLevels={jobLevels} 
            employmentTypes={employmentTypes} 
          />
        </div>
      </div>

      <TableContainer>
        <Table className="table-fixed w-full border-separate border-spacing-0">
          <TableHeader className="bg-[#8B5CF6]">
            <TableRow className="hover:bg-transparent border-none">
              <TableSortHeader label="EMPLOYEE NAME" onClick={() => toggleSort("fullName")} className="w-[240px] px-6 h-12 text-[11px] font-bold !text-white uppercase tracking-wider rounded-tl-xl border-none" />
              <TableSortHeader label="ID" onClick={() => toggleSort("employeeId")} className="w-[120px] px-4 text-[11px] font-bold !text-white uppercase tracking-wider border-none" />
              <TableSortHeader label="DEPARTMENT" onClick={() => toggleSort("deptName")} className="w-[160px] px-4 text-[11px] font-bold !text-white uppercase tracking-wider border-none text-center" />
              <TableSortHeader label="JOB TITLE" onClick={() => toggleSort("jobTitleName")} className="w-[180px] px-4 text-[11px] font-bold !text-white uppercase tracking-wider border-none" />
              <TableSortHeader label="LEVEL" onClick={() => toggleSort("levelName")} className="w-[110px] px-4 text-[11px] font-bold !text-white uppercase tracking-wider border-none text-center" />
              <TableSortHeader label="STATUS" onClick={() => toggleSort("statusName")} className="w-[110px] px-4 text-[11px] font-bold !text-white uppercase tracking-wider border-none text-center" />
              <TableHead className="w-[90px] px-6 text-center text-[11px] font-bold text-white uppercase tracking-wider rounded-tr-xl border-none">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState colSpan={7} message="No employees found" />
            ) : (
              paginatedData.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.fullName}`} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">{emp.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 text-sm truncate block">{emp.fullName}</span>
                        <span className="text-[12px] text-gray-400 truncate block">{emp.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-xs font-medium text-gray-600 truncate">{emp.employeeId}</TableCell>
                  <TableCell className="px-4">
                    <Badge className="bg-[#E0E7FF] text-[#4338CA] border-none px-2 py-0.5 rounded-full font-semibold text-[12px] inline-flex items-center gap-1.5 max-w-full">
                      <span className="w-1 h-1 rounded-full bg-[#4338CA] flex-shrink-0" />
                      <span className="truncate">{emp.deptName}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-xs font-medium text-gray-700 truncate">{emp.jobTitleName}</TableCell>
                  <TableCell className="px-4">
                    <Badge className="bg-[#DCFCE7] text-[#15803D] border-none px-2 py-0.5 rounded-full font-semibold text-[12px] truncate">{emp.levelName}</Badge>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <Badge className="bg-[#FEE2E2] text-[#B91C1C] border-none px-2 py-0.5 rounded-full font-semibold text-[12px] truncate">{emp.statusName}</Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <TableRowActions onEdit={() => setEditingEmployee(emp)} onDelete={() => setDeleteId(emp.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <EntryDialog
        open={!!editingEmployee}
        onOpenChange={(v) => !v && setEditingEmployee(null)}
        title="Edit Employee Information"
        onSubmit={handleEditSubmit} 
        isPending={isPending}
        confirmText="Update Employee"
      >
        <ManualImportForm 
          jobs={jobs} 
          jobLevels={jobLevels} 
          employmentTypes={employmentTypes} 
          initialData={editingEmployee} 
        />
      </EntryDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} isPending={isPending} onConfirm={handleDelete} />
      <StatusDialog open={alertConfig.open} success={alertConfig.success} message={alertConfig.message} onClose={() => setAlertConfig(p => ({ ...p, open: false }))} />
    </div>
  )
}