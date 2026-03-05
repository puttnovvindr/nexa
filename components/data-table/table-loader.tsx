"use client"

import { TableRow, TableCell } from "@/components/ui/table"

interface TableLoaderProps {
  colSpan: number
  rowCount?: number
}

export function TableLoader({ colSpan, rowCount = 5 }: TableLoaderProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-gray-50 last:border-0">
          {Array.from({ length: colSpan }).map((_, j) => (
            <TableCell key={j} className="px-6 py-5">
              <div className="h-5 bg-gray-100 rounded-md animate-pulse w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}