"use client"

import React, { useState } from 'react'
import { OrgUnitWithParent } from "@/types/settings"
import { useDataTable } from "@/hooks/use-data-table" // Import hook pagination
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { OrgLevelBadge } from "@/components/data-table/org-level-badge"
import { TableData } from "@/components/data-table/table-data"
import { TablePagination } from "@/components/data-table/table-pagination" // Import pagination component
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type SafeOrgUnit = OrgUnitWithParent & { [key: string]: unknown }

interface Props {
  data: SafeOrgUnit[]
  isPending: boolean
  onToggleSort: (key: "name" | "hierarchy") => void
  onEdit: (unit: SafeOrgUnit) => void
  onDelete: (id: string | string[]) => void 
}

export function OrgUnitTable({ data, isPending, onToggleSort, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<SafeOrgUnit, "name">({ 
      data: data, 
      searchKey: "name", 
      initialSortKey: "name",
  })

  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(unit => unit.id))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleBulkDelete = () => {
    onDelete(selectedIds)
    setSelectedIds([]) 
  }

  return (
    <div className="w-full space-y-4 text-left font-poppins">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-semibold text-purple-700 ml-2">
            {selectedIds.length} units selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-sm shadow-none text-[12px] font-semibold"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <TableContainer>
        <Table className="w-full table-fixed">
          <TableHeader className="bg-white sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[48px] px-6 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader 
                label="Unit Name" 
                onClick={() => {
                  toggleSort("name")
                  onToggleSort("name")
                }} 
                className="w-[50%]" 
              />
              <TableSortHeader 
                label="Hierarchy" 
                onClick={() => {
                  toggleSort("name")
                  onToggleSort("hierarchy")
                }} 
                className="w-[30%]" 
              />
              <TableSortHeader label="Action" isAction className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableLoader colSpan={4} rowCount={8} /> 
            ) : paginatedData.length === 0 ? (
              <TableEmptyState colSpan={4} message="No units found" description="Try to add a new one." />
            ) : (
              paginatedData.map((unit) => (
                <TableRow 
                  key={unit.id} 
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(unit.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(unit.id)}
                      onChange={(e) => handleSelectRow(unit.id, e.target.checked)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <span className="font-medium text-slate-700 block truncate" title={unit.name}>
                      {unit.name}
                    </span>
                  </TableData>
                  <TableData variant="secondary">
                    <div className="flex items-center">
                      <OrgLevelBadge
                        parentId={unit.parentId === "root" ? null : unit.parentId}
                        parentParentId={unit.parent?.parentId === "root" ? null : unit.parent?.parentId}
                      />
                    </div>
                  </TableData>
                  <TableData variant="action">
                    <TableRowActions 
                      onEdit={() => onEdit(unit)} 
                      onDelete={() => onDelete(unit.id)} 
                    />
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isPending && data.length > 0 && (
        <TablePagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      )}
    </div>
  )
}