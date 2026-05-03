"use client"

import React, { useState } from 'react'
import { Job, OrganizationUnit } from "@prisma/client"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { TablePagination } from "@/components/data-table/table-pagination"
import { useDataTable } from "@/hooks/use-data-table"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type JobWithOrg = Job & { orgUnit: OrganizationUnit }
type EnrichedJob = JobWithOrg & { orgUnitName: string }

interface Props {
  data: EnrichedJob[]
  isPending: boolean
  onEdit: (job: JobWithOrg) => void
  onDelete: (id: string | string[]) => void
}

export function JobTitleTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<EnrichedJob, "jobTitle" | "orgUnitName">({ 
      data: data, 
      searchKey: "jobTitle", 
      initialSortKey: "jobTitle",
  })
  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(job => job.id))
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
            {selectedIds.length} positions selected
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
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px] px-6 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                />
              </TableHead>
              <TableSortHeader
                label="Position Name"
                onClick={() => toggleSort("jobTitle")}
                className="w-[50%]"
              />
              <TableSortHeader
                label="Org. Unit"
                onClick={() => toggleSort("orgUnitName")}
                className="w-[30%]"
              />
              <TableSortHeader label="Action" isAction className="w-[120px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableLoader colSpan={4} rowCount={5} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                message="No positions found"
                description="Try adding a new job title to see it here."
              />
            ) : (
              paginatedData.map((job) => (
                <TableRow 
                  key={job.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(job.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(job.id)}
                      onChange={(e) => handleSelectRow(job.id, e.target.checked)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="secondary">
                    <span className="block truncate" title={job.jobTitle}>
                      {job.jobTitle}
                    </span>
                  </TableData>
                  <TableData variant="secondary">
                    <span className="block truncate" title={job.orgUnitName}>
                      {job.orgUnitName}
                    </span>
                  </TableData>
                  <TableData variant="action">
                    <TableRowActions
                      onEdit={() => onEdit(job)}
                      onDelete={() => onDelete(job.id)}
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