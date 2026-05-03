"use client"

import { ArrowUpDown } from "lucide-react"
import { TableHead } from "../ui/table"
import { cn } from "@/lib/utils"

interface TableSortHeaderProps {
  label: string
  className?: string
  onClick?: () => void
  isAction?: boolean 
  variant?: "midnight" | "import" 
  mapped?: boolean 
  subLabel?: string 
  children?: React.ReactNode
}

export function TableSortHeader({ 
  label, 
  className, 
  onClick, 
  isAction = false,
  variant = "midnight",
  mapped = false,
  subLabel,
  children
}: TableSortHeaderProps) {
  return (
    <TableHead 
      onClick={!isAction && !children ? onClick : undefined}
      className={cn(
        "h-12 px-6 transition-all select-none font-poppins border-b border-gray-200",
        
        variant === "midnight" && "bg-white text-slate-800 text-[12px] font-bold tracking-tight",
        
        variant === "import" && [
            "bg-white text-gray-800 hover:bg-gray-50",
            mapped && "bg-slate-100 text-slate-900"
        ],

        !isAction && !children && "cursor-pointer active:opacity-80",
        className
      )}
    >
      <div className={cn(
        "flex flex-col gap-1",
        isAction ? "items-end" : "items-start" 
      )}>
        {subLabel && (
            <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none">
                {subLabel}
            </span>
        )}
        
        <div className="flex items-center gap-2">
            {children ? (
              children
            ) : (
              <span className={cn(variant === "import" ? "text-[12px] font-semibold" : "font-bold")}>
                  {label}
              </span>
            )}
            
            {!isAction && variant === "midnight" && !children && (
              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-70 group-hover:text-slate-600" />
            )}
        </div>
      </div>
    </TableHead>
  )
}