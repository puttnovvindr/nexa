"use client"

import React, { useState } from 'react'
import { EmploymentType } from "@prisma/client"
import { TableContainer } from "@/components/data-table/table-container"
import { TableRowActions } from "@/components/data-table/table-row-actions"
import { TableEmptyState } from "@/components/data-table/table-empty-state"
import { TableLoader } from "@/components/data-table/table-loader"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { TablePagination } from "@/components/data-table/table-pagination"
import { useDataTable } from "@/hooks/use-data-table"
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  data: EmploymentType[]
  isPending: boolean
  onEdit: (type: EmploymentType) => void
  onDelete: (id: string | string[]) => void
}

const VIBRANT_COLORS = ["#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#6366F1"]

export function EmploymentTypeTable({ data, isPending, onEdit, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { paginatedData, currentPage, setCurrentPage, totalPages, toggleSort } = 
    useDataTable<EmploymentType, "name">({ 
      data: data, 
      searchKey: "name", 
      initialSortKey: "name",
  })

  const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(type => type.id))
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
            {selectedIds.length} types selected
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
                label="Type Name"
                onClick={() => toggleSort("name")}
                className="w-[80%]"
              />
              <TableSortHeader label="Action" isAction className="w-[120px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableLoader colSpan={3} rowCount={8} />
            ) : paginatedData.length === 0 ? (
              <TableEmptyState
                colSpan={3}
                message="No types found"
                description="Define your employment types (e.g., Contract, Full-time) here."
              />
            ) : (
              paginatedData.map((type, index) => (
                <TableRow
                  key={type.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    selectedIds.includes(type.id) && "bg-purple-50/30 hover:bg-purple-50/50"
                  )}
                >
                  <TableData className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(type.id)}
                      onChange={(e) => handleSelectRow(type.id, e.target.checked)}
                      className="cursor-pointer w-3.5 h-3.5 accent-purple-600"
                    />
                  </TableData>

                  <TableData variant="primary">
                    <Badge
                      className="border-none px-3 py-1 rounded-full font-semibold text-[10px] uppercase shadow-none"
                      style={{
                        backgroundColor: `${VIBRANT_COLORS[index % VIBRANT_COLORS.length]}15`,
                        color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
                      }}
                    >
                      {type.name}
                    </Badge>
                  </TableData>

                  <TableData variant="action">
                    <TableRowActions
                      onEdit={() => onEdit(type)}
                      onDelete={() => onDelete(type.id)}
                    />
                  </TableData>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!isPending && data.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  )
}