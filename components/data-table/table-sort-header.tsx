"use client"

import { ArrowUpDown } from "lucide-react"
import { TableHead } from "../ui/table"

interface TableSortHeaderProps {
  label: string
  className?: string
  onClick?: () => void
}

export function TableSortHeader({ label, className, onClick }: TableSortHeaderProps) {
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-100/50 transition-colors select-none ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
        {label} <ArrowUpDown className="w-3 h-3 opacity-80" />
      </div>
    </TableHead>
  )
}