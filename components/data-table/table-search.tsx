"use client"

import { Input } from "../ui/input" 
import { Search } from "lucide-react"
import { cn } from "@/lib/utils" 

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string 
}

export function TableSearch({ value, onChange, placeholder = "Search...", className }: TableSearchProps) {
  return (
    <div className={cn("relative flex-1 max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        className="font-poppins pl-9 bg-white h-10 border-gray-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}