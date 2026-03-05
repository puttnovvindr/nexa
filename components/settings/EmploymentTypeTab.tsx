"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { EmploymentType } from "@prisma/client"
import { createEmploymentType, deleteEmploymentType, updateEmploymentType } from "@/actions/settings-actions"

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
  data: EmploymentType[]
}

export default function EmploymentTypeTab({ data }: Props) {
  const router = useRouter()
  
  const { 
    search, setSearch, paginatedData, currentPage, setCurrentPage, totalPages, toggleSort 
  } = useDataTable<EmploymentType, "name">({ 
    data, 
    searchKey: "name", 
    initialSortKey: "name" 
  })

  const [openAdd, setOpenAdd] = useState(false)
  const [editingType, setEditingType] = useState<EmploymentType | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    
    setIsPending(true)
    try {
      if (editingType) {
        await updateEmploymentType(editingType.id, name)
        setAlertConfig({ open: true, success: true, message: "Type updated successfully!" })
      } else {
        await createEmploymentType(name)
        setAlertConfig({ open: true, success: true, message: "Employment type created!" })
      }
      setOpenAdd(false)
      setEditingType(null)
      router.refresh()
    } catch {
      setAlertConfig({ open: true, success: false, message: "Something went wrong." })
    } finally { setIsPending(false) }
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex w-full justify-between items-center gap-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search type name..." />

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="bg-[#8B5CF6] text-white h-11 px-4 rounded-sm shadow-sm hover:bg-[#7C3AED] cursor-pointer transition-all font-sans text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Type
          </Button>

          <EntryDialog
            open={openAdd || !!editingType}
            onOpenChange={(v) => { if (!v) { setOpenAdd(false); setEditingType(null); } }}
            title={editingType ? "Edit Employment Type" : "Add Employment Type"}
            onSubmit={handleSubmit}
            isPending={isPending}
            confirmText={editingType ? "Update Type" : "Save Type"}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type Name</label>
              <Input 
                name="name" 
                defaultValue={editingType?.name || ""}
                placeholder="e.g. Permanent, Internship" 
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
                label="TYPE NAME" 
                onClick={() => toggleSort("name")} 
                className="w-[60%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider" 
              />
              <TableHead className="w-[20%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider">
                STATUS
              </TableHead>
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
                message="No types found" 
                description="Define your employment types (e.g., Contract, Full-time) here." 
              />
            ) : (
              paginatedData.map((type) => (
                <TableRow key={type.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0 font-sans">
                  <TableCell className="px-6 py-5 truncate font-semibold text-gray-800 text-sm">
                    {type.name}
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase border border-emerald-100 tracking-wide">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <TableRowActions 
                      onEdit={() => setEditingType(type)} 
                      onDelete={() => setDeleteId(type.id)} 
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
            await deleteEmploymentType(deleteId)
            setDeleteId(null)
            setAlertConfig({ open: true, success: true, message: "Type deleted!" })
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