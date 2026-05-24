"use client"

import { useState } from "react"

interface UseBulkProps<T> {
  data: T[]
}

export function useSelectionAndBulkAction<T extends { id: string }>({ data }: UseBulkProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const isAllSelected = data.length > 0 && selectedIds.length === data.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map((item) => item.id))
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const resetSelection = () => {
    setSelectedIds([])
    setDeleteId(null)
    setBulkDeleteConfirm(false)
  }

  return {
    selectedIds,
    setSelectedIds,
    deleteId,
    setDeleteId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
    resetSelection,
  }
}