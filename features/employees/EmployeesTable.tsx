"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import { deleteEmployee, updateEmployee } from "@/actions/employee-actions"
import { EmployeeWithRelations, JobWithDetails } from "@/types/employee"
import { EmploymentType, JobLevel, WorkSchedule, OrganizationUnit } from "@prisma/client" 
import { useDataTable } from "@/hooks/use-data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableContainer } from "@/components/data-table/table-container"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { TableData } from "@/components/data-table/table-data" 
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ManualImportForm from "./ManualImportForm"
import { EmployeeDetailSheet } from "./EmployeeDetailSheet"
import { useSelectionAndBulkAction } from "@/hooks/use-selection-and-bulk-action"
import { useCrudHandler } from "@/hooks/use-crud-handler"

interface EmployeeTableProps {
  data: EmployeeWithRelations[]
  orgUnits: OrganizationUnit[]
  jobs: JobWithDetails[]
  jobLevels: JobLevel[] 
  employmentTypes: EmploymentType[]
  workSchedules: WorkSchedule[]
  search: string
  selectedDepts: string[]
  selectedTitles: string[]
}

type FlattenedEmployee = EmployeeWithRelations & {
  deptName: string
  jobTitleName: string
  levelName: string
  statusName: string
  shiftName: string
  [key: string]: unknown 
}

type EmployeeSortKey = "fullName" | "employeeId" | "jobTitleName" | "deptName"

export default function EmployeeTable({ 
  data, 
  orgUnits, 
  jobs, 
  jobLevels, 
  employmentTypes, 
  workSchedules,
  search,
  selectedDepts,
  selectedTitles,
}: EmployeeTableProps) {
  const router = useRouter()
  
  const [editingEmployee, setEditingEmployee] = useState<FlattenedEmployee | null>(null)
  const [viewingEmployee, setViewingEmployee] = useState<FlattenedEmployee | null>(null)

  const flattenedData = useMemo(() => {
    return data.map((emp): FlattenedEmployee => ({
      ...emp,
      deptName: emp.job?.orgUnit?.name || "N/A",
      jobTitleName: emp.job?.jobTitle || "N/A",
      levelName: emp.jobLevel?.levelName || "N/A",
      statusName: emp.employmentType?.name || emp.status || "N/A",
      shiftName: emp.workSchedule?.shiftName || "Not Set"
    }))
  }, [data])

  const filteredData = useMemo(() => {
    return flattenedData.filter(emp => {
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(emp.deptName)
      const matchesTitle = selectedTitles.length === 0 || selectedTitles.includes(emp.jobId)
      return matchesDept && matchesTitle
    })
  }, [flattenedData, selectedDepts, selectedTitles])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<FlattenedEmployee, EmployeeSortKey>({ 
      data: filteredData, 
      searchKey: "fullName", 
      initialSortKey: "fullName",
      externalSearch: search, 
  })

  const {
    selectedIds,
    setSelectedIds,
    deleteId,
    setDeleteId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
    resetSelection
  } = useSelectionAndBulkAction<FlattenedEmployee>({ data: paginatedData })

  const {
    isPending,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    handleAction
  } = useCrudHandler()

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('permanent')) return "bg-emerald-50 text-emerald-700 border-emerald-100"
    if (s.includes('contract')) return "bg-amber-50 text-amber-700 border-amber-100"
    if (s.includes('probation')) return "bg-blue-50 text-blue-700 border-blue-100"
    return "bg-slate-50 text-slate-700 border-slate-100"
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingEmployee) return
    const formData = new FormData(e.currentTarget)
    handleAction(
      updateEmployee(editingEmployee.id, formData),
      "Employee updated successfully!",
      () => setEditingEmployee(null)
    )
  }

  const handleDelete = async () => {
    const targetIds = deleteId ? [deleteId] : selectedIds
    if (targetIds.length === 0) return
    
    const count = targetIds.length
    handleAction(
      Promise.all(targetIds.map(id => deleteEmployee(id))).then(() => ({ success: true })),
      `${count} employee(s) deleted successfully!`,
      () => {
        resetSelection()
      }
    )
  }

  return (
    <div className="w-full space-y-5 text-left font-poppins">
      
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} employees selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-sm shadow-none text-[12px] font-semibold"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <TableContainer>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px] px-4 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader label="Full Name" onClick={() => toggleSort("fullName")} className="w-[18%]" />
              <TableSortHeader label="ID" onClick={() => toggleSort("employeeId")} className="w-[15%]" />
              <TableSortHeader label="Department" onClick={() => toggleSort("deptName")} className="w-[15%]" />
              <TableSortHeader label="Job Title" onClick={() => toggleSort("jobTitleName")} className="w-[15%]" />
              <TableSortHeader label="Status" className="w-[15%]" />
              <TableSortHeader label="Action" isAction className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState colSpan={7} message="No employees found" description="Try to adjust your search or filters" />
            ) : (
              paginatedData.map((emp) => (
                <TableRow 
                  key={emp.id} 
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(emp.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp.id)}
                      onChange={() => handleSelectRow(emp.id)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate" title={emp.fullName}>{emp.fullName}</span>
                      <span className="text-[12px] text-slate-400 font-semibold truncate" title={emp.email}>{emp.email}</span>
                    </div>
                  </TableData>

                  <TableData variant="secondary" className="truncate">{emp.employeeId}</TableData>
                  
                  <TableData variant="secondary">
                    <span className="block truncate" title={emp.deptName}>
                      {emp.deptName}
                    </span>
                  </TableData>

                  <TableData variant="secondary">
                    <span className="block truncate" title={emp.jobTitleName}>
                      {emp.jobTitleName}
                    </span>
                  </TableData>

                  <TableData>
                    <Badge variant="outline" className={cn("font-semibold text-[10px] px-2.5 py-0.5 uppercase rounded-full shadow-none whitespace-nowrap", getStatusColor(emp.statusName))}>
                      {emp.statusName}
                    </Badge>
                  </TableData>

                  <TableData variant="action">
                    <TableRowActions 
                      onView={() => setViewingEmployee(emp)} 
                      onEdit={() => setEditingEmployee(emp)} 
                      onDelete={() => setDeleteId(emp.id)} 
                    />
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <EmployeeDetailSheet 
        employee={viewingEmployee} 
        open={!!viewingEmployee} 
        onOpenChange={(v) => !v && setViewingEmployee(null)} 
      />

      <EntryDialog
        open={!!editingEmployee}
        onOpenChange={(v) => !v && setEditingEmployee(null)}
        title="Edit Employee Information"
        onSubmit={handleEditSubmit} 
        isPending={isPending}
        showFooter={false} 
      >
        <ManualImportForm 
          orgUnits={orgUnits}
          jobs={jobs} 
          jobLevels={jobLevels} 
          employmentTypes={employmentTypes} 
          workSchedules={workSchedules}
          initialData={editingEmployee} 
          loading={isPending}
        />
      </EntryDialog>

      <DeleteConfirm 
        open={!!deleteId} 
        onOpenChange={(v) => !v && setDeleteId(null)} 
        isPending={isPending} 
        onConfirm={handleDelete} 
      />

      <DeleteConfirm 
        open={bulkDeleteConfirm} 
        onOpenChange={(v) => !v && setBulkDeleteConfirm(false)} 
        isPending={isPending} 
        title={`Delete ${selectedIds.length} Employees`}
        description="Are you sure you want to delete all selected employees? This action cannot be undone."
        onConfirm={handleDelete} 
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