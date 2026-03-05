"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import { createOrgUnit, deleteOrgUnit, updateOrgUnit } from "@/actions/settings-actions"
import { OrgUnitWithParent } from "@/types/settings"

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
import { OrgLevelBadge } from "@/components/data-table/org-level-badge"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

type SafeOrgUnit = OrgUnitWithParent & {
  [key: string]: unknown;
}

type EnrichedOrgUnit = SafeOrgUnit & {
  hierarchy: string;
}

export default function OrgUnitTab({ data }: { data: SafeOrgUnit[] }) {
  const router = useRouter()
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [openAdd, setOpenAdd] = useState(false)
  const [editingUnit, setEditingUnit] = useState<SafeOrgUnit | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ open: false, success: true, message: "" })

  const filteredMasterData = useMemo(() => {
    return data
      .map(unit => ({
        ...unit,
        hierarchy: !unit.parentId ? "Head Office" : unit.parent?.parentId ? "Department" : "Division"
      }))
      .filter(unit => {
        if (selectedLevels.length === 0) return true
        const level = !unit.parentId ? "head" : unit.parent?.parentId ? "division" : "department"
        return selectedLevels.includes(level)
      })
  }, [data, selectedLevels])

  const { 
    search, setSearch, 
    paginatedData, 
    currentPage, setCurrentPage, 
    totalPages,
    toggleSort 
  } = useDataTable<EnrichedOrgUnit, "name" | "hierarchy">({ 
    data: filteredMasterData, 
    searchKey: "name", 
    initialSortKey: "name" 
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const parentId = formData.get("parentId") as string
    const finalParentId = parentId === "none" ? null : parentId
    
    setIsPending(true)
    try {
      if (editingUnit) {
        await updateOrgUnit(editingUnit.id, name, finalParentId)
        setAlertConfig({ open: true, success: true, message: "Unit updated successfully!" })
      } else {
        await createOrgUnit(name, finalParentId)
        setAlertConfig({ open: true, success: true, message: "Organization unit created!" })
      }
      setOpenAdd(false)
      setEditingUnit(null)
      router.refresh()
    } catch {
      setAlertConfig({ open: true, success: false, message: "Something went wrong." })
    } finally { setIsPending(false) }
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex w-full justify-between items-center gap-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search unit name..." />

        <div className="flex items-center gap-2">
          <TableFilter 
            label="Hierarchy"
            options={[
              { id: "head", label: "Head Office" },
              { id: "division", label: "Division" },
              { id: "department", label: "Department" },
            ]}
            selectedValues={selectedLevels}
            onUpdate={setSelectedLevels}
          />

          <Button 
            onClick={() => setOpenAdd(true)}
            className="bg-[#8B5CF6] text-white h-11 px-4 rounded-sm shadow-sm hover:bg-[#7C3AED] cursor-pointer transition-all font-sans text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>

          <EntryDialog
            open={openAdd || !!editingUnit}
            onOpenChange={(v) => {
              if (!v) {
                setOpenAdd(false)
                setEditingUnit(null)
              }
            }}
            title={editingUnit ? "Edit Organization Unit" : "Add Organization Unit"}
            onSubmit={handleSubmit}
            isPending={isPending}
            confirmText={editingUnit ? "Update Unit" : "Save Unit"}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Name</label>
              <Input 
                name="name" 
                defaultValue={editingUnit?.name || ""}
                placeholder="Engineering" 
                className="h-11 w-full rounded-lg border-gray-200 font-sans" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Unit</label>
              <Select name="parentId" defaultValue={editingUnit?.parentId || "none"}>
                <SelectTrigger className="w-full bg-white h-11 rounded-lg border-gray-200 font-sans text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 shadow-xl font-sans w-[--radix-select-trigger-width]">
                  <SelectItem value="none">No Parent (Head Office)</SelectItem>
                  {data
                    .filter(u => u.id !== editingUnit?.id)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </EntryDialog>
        </div>
      </div>

      <TableContainer>
        <Table className="table-fixed w-full font-sans">
          <TableHeader className="bg-[#8B5CF6]">
            <TableRow className="hover:bg-transparent border-none">
              <TableSortHeader 
                label="UNIT NAME" 
                onClick={() => toggleSort("name")} 
                className="w-[45%] px-6 h-14 text-[11px] font-extrabold text-white uppercase tracking-wider" 
              />
              <TableSortHeader 
                label="HIERARCHY" 
                onClick={() => toggleSort("hierarchy")}
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
                message="No units found" 
                description="We couldn't find any organization unit. Try to add a new one!" 
              />
            ) : (
              paginatedData.map((unit) => (
                <TableRow key={unit.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0">
                  <TableCell className="px-6 py-5 truncate font-medium text-gray-800">
                    {unit.name}
                  </TableCell>
                  <TableCell className="px-6">
                    <OrgLevelBadge 
                      parentId={unit.parentId} 
                      parentParentId={unit.parent?.parentId} 
                    />
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <TableRowActions 
                      onEdit={() => setEditingUnit(unit)} 
                      onDelete={() => setDeleteId(unit.id)} 
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
            await deleteOrgUnit(deleteId)
            setDeleteId(null)
            setAlertConfig({ open: true, success: true, message: "Unit deleted successfully!" })
            router.refresh()
          } catch {
            setAlertConfig({ open: true, success: false, message: "Failed to delete unit." })
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