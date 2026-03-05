"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Job, OrganizationUnit } from "@prisma/client"
import { createJobTitle, deleteJobTitle, updateJobTitle } from "@/actions/settings-actions"

import { useDataTable } from "@/hooks/use-data-table"
import { TableSearch } from "@/components/data-table/table-search"
import { TablePagination } from "@/components/data-table/table-pagination"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { TableFilter } from "@/components/data-table/table-filter"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

type JobWithOrg = Job & { 
  orgUnit: OrganizationUnit;
}

type EnrichedJob = JobWithOrg & {
  orgUnitName: string;
}

interface Props {
  data: JobWithOrg[]
  orgUnits: OrganizationUnit[]
}

export default function JobTitleTab({ data, orgUnits }: Props) {
  const router = useRouter()
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [openAdd, setOpenAdd] = useState(false)
  const [editingJob, setEditingJob] = useState<JobWithOrg | null>(null) 
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  // 1. GLOBAL FILTER & ENRICHMENT
  // Kita buat orgUnitName biar bisa di-sort sebagai string biasa
  const filteredMasterData = useMemo(() => {
    return data
      .map(job => ({
        ...job,
        orgUnitName: job.orgUnit?.name || ""
      }))
      .filter(job => {
        if (selectedUnits.length === 0) return true
        return selectedUnits.includes(job.orgUnitId)
      })
  }, [data, selectedUnits])

  // 2. HOOK DATA TABLE
  const { 
    search, setSearch, 
    paginatedData, 
    currentPage, setCurrentPage, 
    totalPages, 
    toggleSort 
  } = useDataTable<EnrichedJob, "jobTitle" | "orgUnitName">({ 
    data: filteredMasterData, 
    searchKey: "jobTitle", 
    initialSortKey: "jobTitle" 
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("jobTitle") as string
    const unitId = formData.get("orgUnitId") as string
    
    setIsPending(true)
    try {
      if (editingJob) {
        await updateJobTitle(editingJob.id, title, unitId)
        setAlertConfig({ open: true, success: true, message: "Position updated successfully!" })
      } else {
        await createJobTitle(title, unitId)
        setAlertConfig({ open: true, success: true, message: "Position created successfully!" })
      }
      setOpenAdd(false)
      setEditingJob(null)
      router.refresh()
    } catch {
      setAlertConfig({ open: true, success: false, message: "Action failed." })
    } finally { setIsPending(false) }
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex w-full justify-between items-center gap-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search position..." />

        <div className="flex items-center gap-2">
          <TableFilter 
            label="Org. Units"
            options={orgUnits.map(u => ({ id: u.id, label: u.name }))}
            selectedValues={selectedUnits}
            onUpdate={setSelectedUnits}
          />

          <Button 
            onClick={() => setOpenAdd(true)}
            className="bg-[#8B5CF6] text-white h-11 px-4 rounded-sm shadow-sm hover:bg-[#7C3AED] cursor-pointer transition-all font-sans text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Position
          </Button>

          <EntryDialog
            open={openAdd || !!editingJob}
            onOpenChange={(v) => { if (!v) { setOpenAdd(false); setEditingJob(null); } }}
            title={editingJob ? "Edit Job Title" : "Add Job Title"}
            onSubmit={handleSubmit}
            isPending={isPending}
            confirmText={editingJob ? "Update Position" : "Save Position"}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Position Name</label>
              <Input 
                name="jobTitle" 
                defaultValue={editingJob?.jobTitle || ""}
                placeholder="e.g. Senior Developer" 
                className="h-11 w-full rounded-lg border-gray-200 font-sans" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization Unit</label>
              <Select name="orgUnitId" defaultValue={editingJob?.orgUnitId || ""} required>
                <SelectTrigger className="w-full bg-white h-11 rounded-lg border-gray-200 font-sans text-left">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 shadow-xl font-sans w-[--radix-select-trigger-width]">
                  {orgUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </EntryDialog>
        </div>
      </div>

      <TableContainer>
        <Table className="table-fixed w-full font-sans border-none">
          <TableHeader className="bg-[#8B5CF6]">
            <TableRow className="hover:bg-transparent border-none">
              <TableSortHeader 
                label="POSITION NAME" 
                onClick={() => toggleSort("jobTitle")} 
                className="w-[45%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider" 
              />
              <TableSortHeader 
                label="ORG. UNIT" 
                onClick={() => toggleSort("orgUnitName")} 
                className="w-[35%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider" 
              />
              <TableHead className="px-6 text-right w-[20%] text-[11px] font-extrabold text-white uppercase tracking-wider">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableLoader colSpan={3} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState 
                colSpan={3} 
                message="No positions found" 
                description="Try adding a new job title to see it here." 
              />
            ) : (
              paginatedData.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50/30 border-b border-gray-100 last:border-0 transition-colors font-sans">
                  <TableCell className="px-6 py-5 truncate font-medium text-gray-800">
                    {job.jobTitle}
                  </TableCell>
                  <TableCell className="px-6 py-5 truncate font-medium text-gray-800">
                    {job.orgUnitName}
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <TableRowActions 
                      onEdit={() => setEditingJob(job)} 
                      onDelete={() => setDeleteId(job.id)} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <DeleteConfirm 
        open={!!deleteId} 
        onOpenChange={(v) => !v && setDeleteId(null)} 
        isPending={isPending} 
        onConfirm={async () => {
          if (!deleteId) return
          setIsPending(true)
          try {
            await deleteJobTitle(deleteId)
            setDeleteId(null)
            setAlertConfig({ open: true, success: true, message: "Position deleted!" })
            router.refresh()
          } catch {
            setAlertConfig({ open: true, success: false, message: "Failed to delete." })
          } finally { setIsPending(false) }
        }} 
      />

      <StatusDialog 
        open={alertConfig.open} 
        success={alertConfig.success} 
        message={alertConfig.message} 
        onClose={() => setAlertConfig(p => ({ ...p, open: false }))} 
      />
    </div>
  )
}