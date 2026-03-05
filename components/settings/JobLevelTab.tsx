"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { JobLevel } from "@prisma/client" 
import { createJobLevel, deleteJobLevel, updateJobLevel } from "@/actions/settings-actions"

import { useDataTable } from "@/hooks/use-data-table"
import { TableSearch } from "@/components/data-table/table-search"
import { TablePagination } from "@/components/data-table/table-pagination"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteConfirm } from "@/components/data-table/delete-confirm"
import { EntryDialog } from "@/components/data-table/entry-dialog"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Plus } from "lucide-react"

interface Props {
  data: JobLevel[]
}

export default function JobLevelTab({ data }: Props) {
  const router = useRouter()

  const { 
    search, setSearch, paginatedData, currentPage, setCurrentPage, totalPages, toggleSort 
  } = useDataTable<JobLevel, "levelName">({ 
    data, 
    searchKey: "levelName", 
    initialSortKey: "levelName" 
  })

  const [openAdd, setOpenAdd] = useState(false)
  const [editingLevel, setEditingLevel] = useState<JobLevel | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const levelName = formData.get("levelName") as string
    
    setIsPending(true)
    try {
      if (editingLevel) {
        await updateJobLevel(editingLevel.id, levelName)
        setAlertConfig({ open: true, success: true, message: "Job level updated successfully!" })
      } else {
        await createJobLevel(levelName) 
        setAlertConfig({ open: true, success: true, message: "Job level created successfully!" })
      }
      setOpenAdd(false)
      setEditingLevel(null)
      router.refresh()
    } catch {
      setAlertConfig({ open: true, success: false, message: "Action failed." })
    } finally { setIsPending(false) }
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex w-full justify-between items-center gap-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search level name..." />

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="bg-[#8B5CF6] text-white h-11 px-4 rounded-sm shadow-sm hover:bg-[#7C3AED] cursor-pointer transition-all font-sans text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Level
          </Button>

          <EntryDialog
            open={openAdd || !!editingLevel}
            onOpenChange={(v) => { if (!v) { setOpenAdd(false); setEditingLevel(null); } }}
            title={editingLevel ? "Edit Job Level" : "Add Job Level"}
            onSubmit={handleSubmit}
            isPending={isPending}
            confirmText={editingLevel ? "Update Level" : "Save Level"}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Level Name</label>
              <Input 
                name="levelName" 
                defaultValue={editingLevel?.levelName || ""}
                placeholder="e.g. Grade 10" 
                className="h-11 w-full rounded-lg border-gray-200 font-sans" 
                required 
              />
            </div>
          </EntryDialog>
        </div>
      </div>

      <TableContainer>
        <Table className="table-fixed w-full font-sans border-none">
          <TableHeader className="bg-[#8B5CF6]">
            <TableRow className="hover:bg-transparent border-none">
              <TableSortHeader 
                label="LEVEL NAME" 
                onClick={() => toggleSort("levelName")} 
                className="w-[80%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider" 
              />
              <TableHead className="px-6 text-right w-[20%] text-[11px] font-extrabold text-white uppercase tracking-wider">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableLoader colSpan={2} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState 
                colSpan={2} 
                message="No job levels found" 
                description="Click 'Add Level' to start defining grades for your organization." 
              />
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0 font-sans">
                  <TableCell className="px-6 py-5 truncate font-medium text-gray-800">
                    {item.levelName}
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <TableRowActions 
                      onEdit={() => setEditingLevel(item)} 
                      onDelete={() => setDeleteId(item.id)} 
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
            await deleteJobLevel(deleteId)
            setDeleteId(null)
            setAlertConfig({ open: true, success: true, message: "Job level deleted!" })
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