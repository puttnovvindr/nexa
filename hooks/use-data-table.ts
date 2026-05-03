"use client"

import { useState, useMemo } from "react"

interface UseDataTableProps<T, K extends string> {
  data: T[]
  searchKey: keyof T
  initialSortKey: K
  itemsPerPage?: number
  externalSearch?: string 
}

export function useDataTable<T extends Record<string, unknown>, K extends string>({ 
  data, 
  searchKey, 
  initialSortKey, 
  itemsPerPage = 5,
  externalSearch, 
}: UseDataTableProps<T, K>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: K; direction: 'asc' | 'desc' }>({
    key: initialSortKey,
    direction: 'asc'
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const toggleSort = (key: K) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const activeSearch = externalSearch !== undefined ? externalSearch : search

  const filteredData = useMemo(() => {
    return [...(data || [])]
      .filter((item) => {
        const val = item[searchKey as string]
        return String(val ?? "").toLowerCase().includes(activeSearch.toLowerCase())
      })
      .sort((a, b) => {
        let valA = ""
        let valB = ""

        const key = sortConfig.key as string

        if (key === "orgUnit") {
          const unitA = a.orgUnit as Record<string, unknown> | undefined
          const unitB = b.orgUnit as Record<string, unknown> | undefined
          valA = String(unitA?.name ?? "").toLowerCase()
          valB = String(unitB?.name ?? "").toLowerCase()
        } else {
          valA = String(a[key] ?? "").toLowerCase()
          valB = String(b[key] ?? "").toLowerCase()
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [data, activeSearch, sortConfig, searchKey])

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return (filteredData || []).slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  return {
    search,
    setSearch: handleSearch,
    currentPage,
    setCurrentPage,
    sortConfig,
    toggleSort,
    paginatedData,
    totalPages,
    filteredData
  }
}