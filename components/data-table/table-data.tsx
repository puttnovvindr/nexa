"use client"

import { ReactNode } from "react"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TableDataProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "status" | "action" | "list"
  className?: string
}

export function TableData({ children, variant = "secondary", className }: TableDataProps) {
  return (
    <TableCell 
      className={cn(
        "px-6 py-3 transition-colors",
        variant === "primary" && "truncate font-semibold font-poppins text-gray-900 text-[12px] tracking-tight",
        variant === "secondary" && "truncate font-poppins text-[12px] text-slate-500 font-medium",
        variant === "list" && "font-poppins text-[12px] text-slate-500 font-medium",
        variant === "status" && "truncate text-[12px] font-poppins",
        variant === "action" && "text-right",
        className
      )}
    >
      {variant === "status" ? (
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold font-poppins border-none inline-block">
          {children}
        </span>
      ) : (
        children
      )}
    </TableCell>
  )
}